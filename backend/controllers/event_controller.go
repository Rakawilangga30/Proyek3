package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
	"BACKEND/models"
)

// Helper: ambil organization_id dari user yang login
func getOrganizationIDByUser(userID int64) (int64, error) {
	var orgID int64
	err := config.DB.Get(&orgID,
		"SELECT id FROM organizations WHERE owner_user_id = ?",
		userID,
	)
	return orgID, err
}

// =======================================
// ORGANIZATION: CREATE EVENT
// =======================================

type CreateEventRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

func CreateEvent(c *gin.Context) {
	userID := c.GetInt64("user_id")

	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization not found for this user"})
		return
	}

	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	res, err := config.DB.Exec(`
		INSERT INTO events (organization_id, title, description, category, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
		orgID,
		req.Title,
		req.Description,
		req.Category,
		time.Now(),
		time.Now(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	eventID, _ := res.LastInsertId()

	c.JSON(http.StatusOK, gin.H{
		"message":  "Event created successfully",
		"event_id": eventID,
	})
}

// =======================================
// ORGANIZATION: LIST MY EVENTS
// =======================================
func ListMyEvents(c *gin.Context) {
	userID := c.GetInt64("user_id")

	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization not found for this user"})
		return
	}

	var events []models.Event
	err = config.DB.Select(&events, `
		SELECT * FROM events 
		WHERE organization_id = ?
		ORDER BY created_at DESC
	`, orgID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}