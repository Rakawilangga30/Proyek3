package controllers

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"BACKEND/config"
	"BACKEND/helpers"

	"github.com/gin-gonic/gin"
)

// =============================================================
// STREAM VIDEO (akses hanya jika sudah beli)
// =============================================================
func StreamSessionVideo(c *gin.Context) {

	filename := c.Param("filename")
	token := c.Query("token")
	expStr := c.Query("exp")

	exp, _ := strconv.ParseInt(expStr, 10, 64)
	if time.Now().Unix() > exp {
		c.JSON(403, gin.H{"error": "URL expired"})
		return
	}

	userID := c.GetInt64("user_id")
	if !helpers.ValidateSignedToken(userID, filename, exp, token) {
		c.JSON(403, gin.H{"error": "Invalid token"})
		return
	}

	// cek kepemilikan sesi
	var sessionID int64
	config.DB.Get(&sessionID,
		"SELECT session_id FROM session_videos WHERE video_url = ?",
		"uploads/videos/"+filename,
	)

	var count int
	config.DB.Get(&count,
		"SELECT COUNT(*) FROM purchases WHERE user_id=? AND session_id=?",
		userID, sessionID,
	)

	if count == 0 {
		c.JSON(403, gin.H{"error": "Unauthorized access"})
		return
	}

	fullPath := filepath.Join("uploads/videos", filename)

	file, err := os.Open(fullPath)
	if err != nil {
		c.JSON(404, gin.H{"error": "Video not found"})
		return
	}

	stat, _ := file.Stat()

	c.Header("Content-Type", "video/mp4")
	c.Header("Accept-Ranges", "bytes")
	c.Header("Content-Length", strconv.FormatInt(stat.Size(), 10))

	http.ServeContent(c.Writer, c.Request, filename, stat.ModTime(), file)
}

// =============================================================
// STREAM FILE — VIEW ONLY (PDF/PPT)
// =============================================================
func StreamSessionFile(c *gin.Context) {

	filename := c.Param("filename")
	token := c.Query("token")
	expStr := c.Query("exp")

	exp, _ := strconv.ParseInt(expStr, 10, 64)
	if time.Now().Unix() > exp {
		c.JSON(403, gin.H{"error": "URL expired"})
		return
	}

	userID := c.GetInt64("user_id")
	if !helpers.ValidateSignedToken(userID, filename, exp, token) {
		c.JSON(403, gin.H{"error": "Invalid token"})
		return
	}

	var sessionID int64
	config.DB.Get(&sessionID,
		"SELECT session_id FROM session_files WHERE file_url = ?",
		"uploads/files/"+filename,
	)

	var count int
	config.DB.Get(&count,
		"SELECT COUNT(*) FROM purchases WHERE user_id=? AND session_id=?",
		userID, sessionID,
	)

	if count == 0 {
		c.JSON(403, gin.H{"error": "Unauthorized"})
		return
	}

	fullPath := filepath.Join("uploads/files", filename)

	file, err := os.Open(fullPath)
	if err != nil {
		c.JSON(404, gin.H{"error": "File not found"})
		return
	}

	stat, _ := file.Stat()

	c.Header("Content-Disposition", "inline")
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Length", strconv.FormatInt(stat.Size(), 10))

	http.ServeContent(c.Writer, c.Request, filename, stat.ModTime(), file)
}
