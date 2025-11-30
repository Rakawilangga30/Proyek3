package controllers

import (
	"strconv"

	"BACKEND/config"

	"github.com/gin-gonic/gin"
)

// ==========================================================
// 1. PUBLISH SESSION
// ==========================================================
func PublishSession(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionIDstr := c.Param("sessionID")

	sessionID, err := strconv.ParseInt(sessionIDstr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid session ID"})
		return
	}

	if !checkSessionOwnedByUser(sessionID, userID) {
		c.JSON(403, gin.H{"error": "You do not own this session"})
		return
	}

	_, err = config.DB.Exec(`
		UPDATE sessions
		SET publish_status = 'PUBLISHED', publish_at = NULL
		WHERE id = ?
	`, sessionID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to publish session"})
		return
	}

	c.JSON(200, gin.H{"message": "Session published successfully"})
}

// ==========================================================
// 2. UNPUBLISH SESSION
// ==========================================================
func UnpublishSession(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionIDstr := c.Param("sessionID")

	sessionID, err := strconv.ParseInt(sessionIDstr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid session ID"})
		return
	}

	if !checkSessionOwnedByUser(sessionID, userID) {
		c.JSON(403, gin.H{"error": "You do not own this session"})
		return
	}

	_, err = config.DB.Exec(`
		UPDATE sessions
		SET publish_status = 'DRAFT', publish_at = NULL
		WHERE id = ?
	`, sessionID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to unpublish session"})
		return
	}

	c.JSON(200, gin.H{"message": "Session set to draft"})
}

// ==========================================================
// 3. SCHEDULE SESSION PUBLISH
// ==========================================================
type ScheduleSessionPublishRequest struct {
	PublishAt string `json:"publish_at" binding:"required"`
}

func ScheduleSessionPublish(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionIDstr := c.Param("sessionID")

	sessionID, err := strconv.ParseInt(sessionIDstr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid session ID"})
		return
	}

	if !checkSessionOwnedByUser(sessionID, userID) {
		c.JSON(403, gin.H{"error": "You do not own this session"})
		return
	}

	var req ScheduleSessionPublishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	_, err = config.DB.Exec(`
		UPDATE sessions
		SET publish_status = 'SCHEDULED',
		    publish_at = ?
		WHERE id = ?
	`, req.PublishAt, sessionID)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to schedule session publish"})
		return
	}

	c.JSON(200, gin.H{
		"message":    "Session scheduled successfully",
		"publish_at": req.PublishAt,
	})
}
