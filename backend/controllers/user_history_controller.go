package controllers

import (
	"net/http"

	"BACKEND/config"

	"github.com/gin-gonic/gin"
)

// =============================
// GET MY CERTIFICATES
// =============================
func GetMyCertificates(c *gin.Context) {
	userID := c.GetInt64("user_id")

	type CertificateRow struct {
		ID              int64   `db:"id" json:"id"`
		EventID         int64   `db:"event_id" json:"event_id"`
		EventTitle      string  `db:"event_title" json:"event_title"`
		Score           float64 `db:"score" json:"score"`
		CertificateCode string  `db:"certificate_code" json:"certificate_code"`
		EarnedAt        string  `db:"earned_at" json:"earned_at"`
	}

	var certificates []CertificateRow
	err := config.DB.Select(&certificates, `
		SELECT uc.id, uc.event_id, e.title as event_title, 
		       uc.total_score_percent as score, 
		       uc.certificate_code,
		       uc.issued_at as earned_at
		FROM user_certificates uc
		JOIN events e ON uc.event_id = e.id
		WHERE uc.user_id = ?
		ORDER BY uc.issued_at DESC
	`, userID)

	if err != nil {
		println("Error fetching certificates:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch certificates"})
		return
	}

	if certificates == nil {
		certificates = []CertificateRow{}
	}

	c.JSON(http.StatusOK, gin.H{"certificates": certificates})
}

// =============================
// GET MY PAYMENTS
// =============================
func GetMyPayments(c *gin.Context) {
	userID := c.GetInt64("user_id")

	type PaymentRow struct {
		ID           int64   `db:"id" json:"id"`
		SessionID    int64   `db:"session_id" json:"session_id"`
		SessionTitle string  `db:"session_title" json:"session_title"`
		EventID      int64   `db:"event_id" json:"event_id"`
		EventTitle   string  `db:"event_title" json:"event_title"`
		Amount       float64 `db:"amount" json:"amount"`
		Status       string  `db:"status" json:"status"`
		OrderID      *string `db:"order_id" json:"order_id"`
		SnapToken    *string `db:"snap_token" json:"snap_token"`
		CreatedAt    string  `db:"created_at" json:"created_at"`
	}

	var payments []PaymentRow
	err := config.DB.Select(&payments, `
		SELECT p.id, p.session_id, s.title as session_title, 
		       e.id as event_id, e.title as event_title,
		       p.price_paid as amount, p.status, p.order_id, p.snap_token,
		       p.purchased_at as created_at
		FROM purchases p
		JOIN sessions s ON p.session_id = s.id
		JOIN events e ON s.event_id = e.id
		WHERE p.user_id = ?
		ORDER BY p.purchased_at DESC
	`, userID)

	if err != nil {
		println("Error fetching payments:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}

	if payments == nil {
		payments = []PaymentRow{}
	}

	c.JSON(http.StatusOK, gin.H{"payments": payments})
}

// =============================
// CANCEL PAYMENT
// =============================
func CancelPayment(c *gin.Context) {
	userID := c.GetInt64("user_id")
	paymentID := c.Param("id")

	// Check if payment exists and belongs to user
	var status string
	err := config.DB.Get(&status, `
		SELECT status FROM purchases WHERE id = ? AND user_id = ?
	`, paymentID, userID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	if status != "PENDING" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending payments can be cancelled"})
		return
	}

	// Update status to CANCELLED
	_, err = config.DB.Exec(`
		UPDATE purchases SET status = 'CANCELLED' WHERE id = ? AND user_id = ?
	`, paymentID, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment cancelled successfully"})
}
