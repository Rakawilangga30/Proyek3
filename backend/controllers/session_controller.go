package controllers

import (
	"BACKEND/config"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Helper Local: Cek apakah event milik organisasi (user ini)
func checkEventOwnedByUser(eventID, userID int64) bool {
	var count int
	err := config.DB.Get(&count, `
		SELECT COUNT(*) FROM events e
		JOIN organizations o ON e.organization_id = o.id
		WHERE e.id = ? AND o.owner_user_id = ?
	`, eventID, userID)
	return err == nil && count > 0
}

// Input struct untuk Create/Update Session
type SessionInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Price       int64  `json:"price"` 
}

// ---------------------------------------------
// UPDATE SESSION
// ---------------------------------------------
func UpdateSession(c *gin.Context) {
	sessionIDStr := c.Param("sessionID")
	sessionID, err := strconv.ParseInt(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Session ID"})
		return
	}

	userID := c.GetInt64("user_id")

	// Validasi Kepemilikan
	var count int
	checkQuery := `
		SELECT COUNT(*) FROM sessions s
		JOIN events e ON s.event_id = e.id
		JOIN organizations o ON e.organization_id = o.id
		WHERE s.id = ? AND o.owner_user_id = ?
	`
	err = config.DB.Get(&count, checkQuery, sessionID, userID)
	if err != nil || count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Sesi tidak ditemukan atau Anda tidak memiliki akses"})
		return
	}

	var input SessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateQuery := `UPDATE sessions SET title = ?, description = ?, price = ? WHERE id = ?`
	_, err = config.DB.Exec(updateQuery, input.Title, input.Description, input.Price, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate sesi: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sesi berhasil diperbarui"})
}

// ---------------------------------------------
// DELETE SESSION (FIXED: Manual Cascade)
// ---------------------------------------------
func DeleteSession(c *gin.Context) {
	sessionIDStr := c.Param("sessionID")
	sessionID, _ := strconv.ParseInt(sessionIDStr, 10, 64)
	userID := c.GetInt64("user_id")

	// 1. Cek Kepemilikan
	var count int
	checkQuery := `
		SELECT COUNT(*) FROM sessions s
		JOIN events e ON s.event_id = e.id
		JOIN organizations o ON e.organization_id = o.id
		WHERE s.id = ? AND o.owner_user_id = ?
	`
	config.DB.Get(&count, checkQuery, sessionID, userID)
	if count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak"})
		return
	}

	// 2. Hapus File Fisik (Video & Modul)
	var filePaths []string
	config.DB.Select(&filePaths, "SELECT video_url FROM session_videos WHERE session_id = ?", sessionID)
	var docPaths []string
	config.DB.Select(&docPaths, "SELECT file_url FROM session_files WHERE session_id = ?", sessionID)
	filePaths = append(filePaths, docPaths...)

	for _, path := range filePaths {
		if path != "" { os.Remove(path) }
	}

	// 3. Hapus DATA ANAK Dulu (Video, File, Purchase) dari Database
	// Agar tidak kena error constraint foreign key
	_, err := config.DB.Exec("DELETE FROM session_videos WHERE session_id = ?", sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data video: " + err.Error()})
		return
	}
	_, err = config.DB.Exec("DELETE FROM session_files WHERE session_id = ?", sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data file: " + err.Error()})
		return
	}
	// Hapus history pembelian jika ada (karena foreign key ke session)
	config.DB.Exec("DELETE FROM purchases WHERE session_id = ?", sessionID)

	// 4. Baru Hapus Sesi
	_, err = config.DB.Exec("DELETE FROM sessions WHERE id = ?", sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus sesi (DB constraint): " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sesi dan materinya berhasil dihapus"})
}