package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"BACKEND/config"
)

// =============================
// BUY SESSION
// =============================
func BuySession(c *gin.Context) {

	userID := c.GetInt64("user_id")
	sessionIDstr := c.Param("sessionID")

	sessionID, err := strconv.ParseInt(sessionIDstr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid session ID"})
		return
	}

	// Check session exists and published
	var price float64
	var publishStatus string

	err = config.DB.Get(&price, `
		SELECT price FROM sessions WHERE id = ?
	`, sessionID)
	if err != nil {
		c.JSON(404, gin.H{"error": "Session not found"})
		return
	}

	err = config.DB.Get(&publishStatus, `
		SELECT publish_status FROM sessions WHERE id = ?
	`, sessionID)
	if err != nil || publishStatus != "PUBLISHED" {
		c.JSON(403, gin.H{"error": "Session is not published"})
		return
	}

	// Check if user already bought session
	var count int
	config.DB.Get(&count, `
		SELECT COUNT(*) FROM purchases 
		WHERE user_id = ? AND session_id = ?
	`, userID, sessionID)

	if count > 0 {
		c.JSON(400, gin.H{"error": "You already purchased this session"})
		return
	}

	// Insert new purchase record
	_, err = config.DB.Exec(`
		INSERT INTO purchases (user_id, session_id, price_paid) 
		VALUES (?, ?, ?)
	`, userID, sessionID, price)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to complete purchase"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Purchase successful",
		"session_id": sessionID,
		"price_paid": price,
	})
}

// =============================
// LIST PURCHASED SESSIONS
// =============================
func MyPurchases(c *gin.Context) {

	userID := c.GetInt64("user_id")

	var purchases []struct {
		PurchaseID int64   `db:"id" json:"id"`
		SessionID  int64   `db:"session_id" json:"session_id"`
		Title      string  `db:"title" json:"title"`
		PricePaid  float64 `db:"price_paid" json:"price_paid"`
	}

	err := config.DB.Select(&purchases, `
		SELECT p.id, p.session_id, s.title, p.price_paid
		FROM purchases p
		JOIN sessions s ON p.session_id = s.id
		WHERE p.user_id = ?
		ORDER BY p.purchased_at DESC
	`, userID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to load purchased sessions"})
		return
	}

	c.JSON(200, gin.H{"purchases": purchases})
}
