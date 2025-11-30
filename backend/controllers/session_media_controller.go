package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
	"BACKEND/models"
)

const MaxVideoSize = 1 << 30 // 1 GB = 1 * 2^30 bytes

// cek session dimiliki event yang dimiliki user

// =======================================
// UPLOAD VIDEO KE SESI
// =======================================
func UploadSessionVideo(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionIDParam := c.Param("sessionID")

	var sessionID int64
	if _, err := fmt.Sscan(sessionIDParam, &sessionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	if !checkSessionOwnedByUser(sessionID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't own this session"})
		return
	}

	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video file is required"})
		return
	}

	if file.Size > MaxVideoSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video size exceeds 1GB limit"})
		return
	}

	ext := filepath.Ext(file.Filename)
	switch ext {
	case ".mp4", ".mkv", ".mov", ".avi":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only mp4/mkv/mov/avi allowed"})
		return
	}

	title := c.PostForm("title")
	if title == "" {
		title = file.Filename
	}

	filename := fmt.Sprintf("session_%d_%d%s", sessionID, time.Now().Unix(), ext)
	path := "uploads/videos/" + filename

	if err := c.SaveUploadedFile(file, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save video"})
		return
	}

	// order_index
	var maxOrder int
	config.DB.Get(&maxOrder, `
		SELECT COALESCE(MAX(order_index), 0) FROM session_videos WHERE session_id = ?
	`, sessionID)

	newOrder := maxOrder + 1

	_, err = config.DB.Exec(`
		INSERT INTO session_videos (session_id, title, video_url, size_bytes, order_index, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
		sessionID,
		title,
		path,
		file.Size,
		newOrder,
		time.Now(),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save video metadata"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Video uploaded successfully",
		"path":    path,
	})
}

// =======================================
// UPLOAD FILE MATERI KE SESI
// =======================================
func UploadSessionFile(c *gin.Context) {
	userID := c.GetInt64("user_id")
	sessionIDParam := c.Param("sessionID")

	var sessionID int64
	if _, err := fmt.Sscan(sessionIDParam, &sessionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	if !checkSessionOwnedByUser(sessionID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't own this session"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	ext := filepath.Ext(file.Filename)
	switch ext {
	case ".pdf", ".ppt", ".pptx", ".doc", ".docx":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pdf/ppt/pptx/doc/docx allowed"})
		return
	}

	title := c.PostForm("title")
	if title == "" {
		title = file.Filename
	}

	filename := fmt.Sprintf("session_%d_%d%s", sessionID, time.Now().Unix(), ext)
	path := "uploads/files/" + filename

	if err := c.SaveUploadedFile(file, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	var maxOrder int
	config.DB.Get(&maxOrder, `
		SELECT COALESCE(MAX(order_index), 0) FROM session_files WHERE session_id = ?
	`, sessionID)
	newOrder := maxOrder + 1

	_, err = config.DB.Exec(`
		INSERT INTO session_files (session_id, title, file_url, size_bytes, order_index, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
		sessionID,
		title,
		path,
		file.Size,
		newOrder,
		time.Now(),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file metadata"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"path":    path,
	})
}

// ================================
// ORGANIZATION: GET MEDIA IN SESSION
// ================================
func GetSessionMedia(c *gin.Context) {

	userID := c.GetInt64("user_id")
	sessionIDStr := c.Param("sessionID")

	var sessionID int64
	_, err := fmt.Sscan(sessionIDStr, &sessionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// cek apakah sesi milik organisasi pemilik event
	if !checkSessionOwnedByUser(sessionID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't own this session"})
		return
	}

	// ambil video
	var videos []models.SessionVideo
	err = config.DB.Select(&videos, `
    SELECT * FROM session_videos 
    WHERE session_id = ?
    ORDER BY order_index ASC
`, sessionID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get videos"})
		return
	}

	// ambil file materi
	var files []models.SessionFile
	err = config.DB.Select(&files, `
    SELECT * FROM session_files 
    WHERE session_id = ?
    ORDER BY order_index ASC
`, sessionID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get files"})
		return
	}

	// response
	c.JSON(http.StatusOK, gin.H{
		"videos": videos,
		"files":  files,
	})
}
