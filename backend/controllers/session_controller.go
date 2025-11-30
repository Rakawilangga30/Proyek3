package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
)

// Cek apakah event milik organisasi (user ini)
func checkEventOwnedByUser(eventID, userID int64) bool {
	var count int
	err := config.DB.Get(&count, `
		SELECT COUNT(*) FROM events e
		JOIN organizations o ON e.organization_id = o.id
		WHERE e.id = ? AND o.owner_user_id = ?
	`, eventID, userID)

	if err != nil || count == 0 {
		return false
	}
	return true
}

// =======================================
// ORGANIZATION: CREATE SESSION IN EVENT
// =======================================

type CreateSessionRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Price       int64  `json:"price"` // rupiah, 0 = gratis
}

func CreateSession(c *gin.Context) {
	userID := c.GetInt64("user_id")
	eventIDParam := c.Param("eventID")

	var eventID int64
	_, err := fmt.Sscan(eventIDParam, &eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	if !checkEventOwnedByUser(eventID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't own this event"})
		return
	}

	var req CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// cari order_index berikutnya
	var maxOrder int
	config.DB.Get(&maxOrder, `
		SELECT COALESCE(MAX(order_index), 0) FROM sessions WHERE event_id = ?
	`, eventID)

	newOrder := maxOrder + 1

	res, err := config.DB.Exec(`
		INSERT INTO sessions (event_id, title, description, price, order_index, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
		eventID,
		req.Title,
		req.Description,
		req.Price,
		newOrder,
		time.Now(),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	sessionID, _ := res.LastInsertId()

	c.JSON(http.StatusOK, gin.H{
		"message":    "Session created successfully",
		"session_id": sessionID,
	})
}
