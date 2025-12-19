package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"BACKEND/config"
)

func checkSessionOwnedByUserID(sessionID int64, userID int64) bool {
	var count int
	config.DB.Get(&count, `SELECT COUNT(*) FROM sessions s JOIN events e ON s.event_id = e.id JOIN organizations o ON e.organization_id = o.id WHERE s.id = ? AND o.owner_user_id = ?`, sessionID, userID)
	return count > 0
}

func PublishSession(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionID, _ := strconv.ParseInt(c.Param("sessionID"), 10, 64)

	if !checkSessionOwnedByUserID(sessionID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	_, err := config.DB.Exec(`UPDATE sessions SET publish_status = 'PUBLISHED', publish_at = NULL WHERE id = ?`, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Session published!", "status": "PUBLISHED"})
}

func UnpublishSession(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionID, _ := strconv.ParseInt(c.Param("sessionID"), 10, 64)

	if !checkSessionOwnedByUserID(sessionID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	_, err := config.DB.Exec(`UPDATE sessions SET publish_status = 'DRAFT', publish_at = NULL WHERE id = ?`, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unpublish session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Session drafted!", "status": "DRAFT"})
}

func ScheduleSessionPublish(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionID, _ := strconv.ParseInt(c.Param("sessionID"), 10, 64)

	if !checkSessionOwnedByUserID(sessionID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var req struct {
		PublishAt string `json:"publish_at" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	// Parsing Tanggal Fleksibel
	parsedTime, err := time.Parse("2006-01-02T15:04", req.PublishAt)
	if err != nil {
		parsedTime, err = time.Parse(time.RFC3339, req.PublishAt)
		if err != nil {
			fmt.Println("Date Parse Error:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
	}
	sqlTimeStr := parsedTime.Format("2006-01-02 15:04:05")

	_, err = config.DB.Exec(`UPDATE sessions SET publish_status = 'SCHEDULED', publish_at = ? WHERE id = ?`, sqlTimeStr, sessionID)
	if err != nil {
		fmt.Println("DB Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Session scheduled!", "status": "SCHEDULED", "publish_at": req.PublishAt})
}