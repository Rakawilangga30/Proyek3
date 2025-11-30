package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"BACKEND/config"
)

// =====================================================
// HELPER: CEK apakah event dimiliki oleh user ini
// =====================================================
func checkEventOwnedByUserID(eventID int64, userID int64) bool {

	var count int
	err := config.DB.Get(&count, `
		SELECT COUNT(*)
		FROM events e
		JOIN organizations o ON e.organization_id = o.id
		WHERE e.id = ? AND o.owner_user_id = ?
	`, eventID, userID)

	return err == nil && count > 0
}

// =====================================================
// 1. PUBLISH EVENT (langsung tampil untuk user)
// =====================================================
func PublishEvent(c *gin.Context) {
	userID := c.GetInt64("user_id")
	eventIDStr := c.Param("id")

	eventID, err := strconv.ParseInt(eventIDStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid event ID"})
		return
	}

	// cek kepemilikan
	if !checkEventOwnedByUserID(eventID, userID) {
		c.JSON(403, gin.H{"error": "You do not own this event"})
		return
	}

	_, err = config.DB.Exec(`
		UPDATE events
		SET publish_status = 'PUBLISHED',
		    publish_at = NULL
		WHERE id = ?
	`, eventID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to publish event"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Event published successfully",
	})
}

// =====================================================
// 2. UNPUBLISH EVENT (kembali jadi draft)
// =====================================================
func UnpublishEvent(c *gin.Context) {
	userID := c.GetInt64("user_id")
	eventIDStr := c.Param("id")

	eventID, err := strconv.ParseInt(eventIDStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid event ID"})
		return
	}

	// cek kepemilikan
	if !checkEventOwnedByUserID(eventID, userID) {
		c.JSON(403, gin.H{"error": "You do not own this event"})
		return
	}

	_, err = config.DB.Exec(`
		UPDATE events
		SET publish_status = 'DRAFT',
		    publish_at = NULL
		WHERE id = ?
	`, eventID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to unpublish event"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Event set to draft",
	})
}

// =====================================================
// 3. JADWALKAN PUBLISH EVENT
// =====================================================

type SchedulePublishRequest struct {
	PublishAt string `json:"publish_at" binding:"required"`
}

func SchedulePublish(c *gin.Context) {
	userID := c.GetInt64("user_id")
	eventIDStr := c.Param("id")

	eventID, err := strconv.ParseInt(eventIDStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid event ID"})
		return
	}

	// cek kepemilikan
	if !checkEventOwnedByUserID(eventID, userID) {
		c.JSON(403, gin.H{"error": "You do not own this event"})
		return
	}

	var req SchedulePublishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	_, err = config.DB.Exec(`
		UPDATE events
		SET publish_status = 'SCHEDULED',
		    publish_at = ?
		WHERE id = ?
	`, req.PublishAt, eventID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to schedule event publish"})
		return
	}

	c.JSON(200, gin.H{
		"message":     "Event scheduled successfully",
		"publish_at":  req.PublishAt,
	})
}
