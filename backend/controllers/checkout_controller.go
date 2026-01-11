package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"BACKEND/config"

	"github.com/gin-gonic/gin"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

// ===============================================
// CART CHECKOUT
// ===============================================

// CheckoutCart - Create payment for all items in cart
// POST /user/cart/checkout
func CheckoutCart(c *gin.Context) {
	userID := c.GetInt64("user_id")

	// Get cart
	var cart struct {
		ID            int64   `db:"id"`
		AffiliateCode *string `db:"affiliate_code"`
	}
	err := config.DB.Get(&cart, "SELECT id, affiliate_code FROM carts WHERE user_id = ?", userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keranjang kosong"})
		return
	}

	// Get cart items
	var items []struct {
		ID        int64   `db:"id"`
		ItemType  string  `db:"item_type"`
		SessionID *int64  `db:"session_id"`
		EventID   *int64  `db:"event_id"`
		Price     float64 `db:"price"`
	}
	config.DB.Select(&items, "SELECT id, item_type, session_id, event_id, price FROM cart_items WHERE cart_id = ?", cart.ID)

	if len(items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keranjang kosong"})
		return
	}

	// Calculate total
	var total float64
	for _, item := range items {
		total += item.Price
	}

	if total < 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Total minimal Rp 100 untuk pembayaran"})
		return
	}

	// Get user details
	var user struct {
		Name     string `db:"name"`
		Email    string `db:"email"`
		Phone    string `db:"phone"`
		Username string `db:"username"`
	}
	config.DB.Get(&user, "SELECT name, email, COALESCE(phone, '') as phone, COALESCE(username, '') as username FROM users WHERE id = ?", userID)

	// Check profile completeness
	if user.Name == "" || user.Email == "" || user.Phone == "" || user.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":              "Lengkapi profil Anda terlebih dahulu",
			"profile_incomplete": true,
		})
		return
	}

	// Generate order ID - save base order ID for database updates
	baseOrderID := fmt.Sprintf("CART-%d-%d-%d", time.Now().Unix(), cart.ID, userID)
	orderID := baseOrderID

	// Start transaction
	tx, _ := config.DB.Beginx()
	defer tx.Rollback()

	// Create purchases for each item
	for _, item := range items {
		if item.ItemType == "SESSION" && item.SessionID != nil {
			// Single session purchase
			_, err := tx.Exec(`
				INSERT INTO purchases (user_id, session_id, price_paid, status, order_id)
				VALUES (?, ?, ?, 'PENDING', ?)
				ON DUPLICATE KEY UPDATE status = 'PENDING', order_id = ?, price_paid = ?
			`, userID, *item.SessionID, item.Price, baseOrderID, baseOrderID, item.Price)
			if err != nil {
				fmt.Printf("[CHECKOUT] Error creating purchase: %v\n", err)
			}
		} else if item.ItemType == "EVENT_PACKAGE" && item.EventID != nil {
			// Package = all sessions in event
			var sessionIDs []int64
			config.DB.Select(&sessionIDs, "SELECT id FROM sessions WHERE event_id = ? AND publish_status = 'PUBLISHED'", *item.EventID)

			pricePerSession := item.Price / float64(len(sessionIDs))
			for _, sessID := range sessionIDs {
				tx.Exec(`
					INSERT INTO purchases (user_id, session_id, price_paid, status, order_id)
					VALUES (?, ?, ?, 'PENDING', ?)
					ON DUPLICATE KEY UPDATE status = 'PENDING', order_id = ?, price_paid = ?
				`, userID, sessID, pricePerSession, baseOrderID, baseOrderID, pricePerSession)
			}
		}
	}

	// Store affiliate code in order for later split payment
	if cart.AffiliateCode != nil {
		// We'll parse this from order ID later in processSuccessfulPayment
		orderID = fmt.Sprintf("%s-AFF-%s", baseOrderID, *cart.AffiliateCode)
	}

	// Create Midtrans payment
	var midtransItems []midtrans.ItemDetails
	for i, item := range items {
		itemName := fmt.Sprintf("Item %d", i+1)
		if item.ItemType == "SESSION" {
			var title string
			config.DB.Get(&title, "SELECT title FROM sessions WHERE id = ?", item.SessionID)
			itemName = title
		} else {
			var title string
			config.DB.Get(&title, "SELECT title FROM events WHERE id = ?", item.EventID)
			itemName = fmt.Sprintf("%s (Package)", title)
		}
		if len(itemName) > 50 {
			itemName = itemName[:47] + "..."
		}

		midtransItems = append(midtransItems, midtrans.ItemDetails{
			ID:    strconv.Itoa(i + 1),
			Name:  itemName,
			Price: int64(item.Price),
			Qty:   1,
		})
	}

	snapReq := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: int64(total),
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: user.Name,
			Email: user.Email,
			Phone: user.Phone,
		},
		Items: &midtransItems,
		EnabledPayments: []snap.SnapPaymentType{
			"gopay",
		},
	}

	snapResp, snapErr := config.SnapClient.CreateTransaction(snapReq)
	if snapErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment: " + snapErr.Message})
		return
	}

	// Update all purchases with snap token
	// IMPORTANT: Store BOTH order IDs - base for our DB lookup, full for Midtrans lookup
	tx.Exec("UPDATE purchases SET snap_token = ?, midtrans_order_id = ? WHERE order_id = ?", snapResp.Token, orderID, baseOrderID)

	tx.Commit()

	fmt.Printf("[CART-CHECKOUT] ✅ Created order: base=%s, midtrans=%s, items=%d\n", baseOrderID, orderID, len(items))

	c.JSON(http.StatusOK, gin.H{
		"token":             snapResp.Token,
		"redirect_url":      snapResp.RedirectURL,
		"order_id":          baseOrderID, // For DB lookup
		"midtrans_order_id": orderID,     // For Midtrans API check (includes affiliate code)
		"total":             total,
		"item_count":        len(items),
	})
}

// ===============================================
// UPDATED processSuccessfulPayment for Cart Checkout
// ===============================================

// ProcessCartPayment handles successful cart payment with split payments
// Called from HandleMidtransNotification when order starts with "CART-"
func ProcessCartPayment(orderID string, grossAmount string) error {
	// Parse affiliate code from order ID if present
	var affiliateCode *string
	if strings.Contains(orderID, "-AFF-") {
		parts := strings.Split(orderID, "-AFF-")
		if len(parts) == 2 {
			affiliateCode = &parts[1]
			orderID = parts[0] // Use base order ID for DB queries
		}
	}

	tx, _ := config.DB.Beginx()
	defer tx.Rollback()

	// Update all purchases to PAID (use exact match since we store baseOrderID)
	_, err := tx.Exec("UPDATE purchases SET status = 'PAID' WHERE order_id = ?", orderID)
	if err != nil {
		return fmt.Errorf("failed to update purchases: %v", err)
	}

	// Get all purchases in this order
	var purchases []struct {
		ID         int64   `db:"id"`
		SessionID  int64   `db:"session_id"`
		PricePaid  float64 `db:"price_paid"`
		EventID    int64   `db:"event_id"`
		OrgID      int64   `db:"org_id"`
		IsOfficial bool    `db:"is_official"`
	}
	tx.Select(&purchases, `
		SELECT p.id, p.session_id, p.price_paid, e.id as event_id, 
			o.id as org_id, COALESCE(o.is_official, 0) as is_official
		FROM purchases p
		JOIN sessions s ON p.session_id = s.id
		JOIN events e ON s.event_id = e.id
		JOIN organizations o ON e.organization_id = o.id
		WHERE p.order_id = ?
	`, orderID)

	// Get buyer ID
	var buyerID int64
	tx.Get(&buyerID, "SELECT user_id FROM purchases WHERE order_id = ? LIMIT 1", orderID)

	// Process each purchase with split payment
	for _, purchase := range purchases {
		if purchase.IsOfficial {
			continue // Skip official org - no balance credit
		}

		// Check if affiliate code is valid for this event
		var partnership struct {
			UserID               int64   `db:"user_id"`
			CommissionPercentage float64 `db:"commission_percentage"`
		}

		hasAffiliate := false
		if affiliateCode != nil {
			err := tx.Get(&partnership, `
				SELECT user_id, commission_percentage 
				FROM affiliate_partnerships 
				WHERE unique_code = ? AND event_id = ? AND status = 'APPROVED'
			`, *affiliateCode, purchase.EventID)
			if err == nil {
				hasAffiliate = true
			}
		}

		if hasAffiliate {
			// Split payment: affiliate gets commission, org gets remainder
			commission := purchase.PricePaid * (partnership.CommissionPercentage / 100)
			orgAmount := purchase.PricePaid - commission

			// Credit affiliate balance
			tx.Exec(`
				INSERT INTO affiliate_balances (user_id, balance, total_earned)
				VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE 
					balance = balance + ?,
					total_earned = total_earned + ?
			`, partnership.UserID, commission, commission, commission, commission)

			// Record affiliate transaction
			tx.Exec(`
				INSERT INTO financial_transactions (transaction_type, entity_type, entity_id, amount, description, reference_id)
				VALUES ('AFFILIATE_CREDIT', 'AFFILIATE', ?, ?, ?, ?)
			`, partnership.UserID, commission, fmt.Sprintf("Komisi dari session ID %d", purchase.SessionID), orderID)

			// Credit org balance (minus commission)
			tx.Exec(`
				INSERT INTO organization_balances (organization_id, balance, total_earned)
				VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE 
					balance = balance + ?,
					total_earned = total_earned + ?
			`, purchase.OrgID, orgAmount, orgAmount, orgAmount, orgAmount)

			// Notify affiliate
			CreateNotification(
				partnership.UserID,
				"affiliate_sale",
				"🛒 Penjualan dari Kode Promo!",
				fmt.Sprintf("Anda mendapat komisi Rp %.0f dari penjualan", commission),
			)

		} else {
			// No affiliate - full amount to org
			tx.Exec(`
				INSERT INTO organization_balances (organization_id, balance, total_earned)
				VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE 
					balance = balance + ?,
					total_earned = total_earned + ?
			`, purchase.OrgID, purchase.PricePaid, purchase.PricePaid, purchase.PricePaid, purchase.PricePaid)
		}

		// Record org transaction
		tx.Exec(`
			INSERT INTO financial_transactions (transaction_type, entity_type, entity_id, amount, description, reference_id)
			VALUES ('SALE', 'ORGANIZATION', ?, ?, ?, ?)
		`, purchase.OrgID, purchase.PricePaid, fmt.Sprintf("Penjualan session ID %d", purchase.SessionID), orderID)
	}

	// Clear cart
	tx.Exec("DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?", buyerID)
	tx.Exec("UPDATE carts SET affiliate_code = NULL WHERE user_id = ?", buyerID)

	// Notify buyer
	CreateNotification(
		buyerID,
		"purchase_success",
		"✅ Pembayaran Berhasil!",
		fmt.Sprintf("Pembelian %d item berhasil. Silakan akses konten Anda.", len(purchases)),
	)

	return tx.Commit()
}
