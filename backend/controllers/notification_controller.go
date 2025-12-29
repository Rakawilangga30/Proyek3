package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
)

// =============================
// GET MY NOTIFICATIONS
// =============================
func GetMyNotifications(c *gin.Context) {
	userID := c.GetInt64("user_id")

	type NotificationRow struct {
		ID        int64  `db:"id" json:"id"`
		UserID    int64  `db:"user_id" json:"user_id"`
		Type      string `db:"type" json:"type"`
		Title     string `db:"title" json:"title"`
		Message   string `db:"message" json:"message"`
		IsRead    bool   `db:"is_read" json:"is_read"`
		CreatedAt string `db:"created_at" json:"created_at"`
	}

	var notifications []NotificationRow
	err := config.DB.Select(&notifications, `
		SELECT id, user_id, 
		       COALESCE(type, '') as type, 
		       COALESCE(title, '') as title, 
		       COALESCE(message, '') as message, 
		       is_read, 
		       created_at
		FROM notifications 
		WHERE user_id = ? 
		ORDER BY created_at DESC 
		LIMIT 50
	`, userID)

	if err != nil {
		println("Error fetching notifications:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications: " + err.Error()})
		return
	}

	if notifications == nil {
		notifications = []NotificationRow{}
	}

	// Count unread
	var unreadCount int
	config.DB.Get(&unreadCount, `SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE`, userID)

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"unread_count":  unreadCount,
	})
}

// =============================
// MARK NOTIFICATION AS READ
// =============================
func MarkNotificationAsRead(c *gin.Context) {
	userID := c.GetInt64("user_id")
	notifID := c.Param("id")

	_, err := config.DB.Exec(`
		UPDATE notifications SET is_read = TRUE 
		WHERE id = ? AND user_id = ?
	`, notifID, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
}

// =============================
// MARK ALL AS READ
// =============================
func MarkAllNotificationsAsRead(c *gin.Context) {
	userID := c.GetInt64("user_id")

	_, err := config.DB.Exec(`UPDATE notifications SET is_read = TRUE WHERE user_id = ?`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// =============================
// CREATE NOTIFICATION (Internal helper)
// =============================
func CreateNotification(userID int64, notifType, title, message string) error {
	_, err := config.DB.Exec(`
		INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
		VALUES (?, ?, ?, ?, FALSE, ?)
	`, userID, notifType, title, message, time.Now())
	return err
}
