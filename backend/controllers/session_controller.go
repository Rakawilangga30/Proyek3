package controllers

import (
	"BACKEND/config"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Helper: Cek apakah event milik organisasi (user ini)
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

// Input struct khusus untuk Update Session
type SessionUpdateInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Price       int64  `json:"price"` 
}

// ---------------------------------------------
// UPDATE SESSION
// ---------------------------------------------
func UpdateSession(c *gin.Context) {
	// Ambil Session ID dari URL
	sessionIDStr := c.Param("sessionID")
	sessionID, err := strconv.ParseInt(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Session ID"})
		return
	}

	// Ambil User ID dari Token
	userID := c.GetInt64("user_id")

	// Validasi Kepemilikan Sesi
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

	// Bind JSON Input
	var input SessionUpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update Database
	// PERBAIKAN: Menghapus "updated_at = NOW()" karena kolom tersebut tidak ada di tabel sessions
	updateQuery := `
		UPDATE sessions 
		SET title = ?, description = ?, price = ?
		WHERE id = ?
	`
	_, err = config.DB.Exec(updateQuery, input.Title, input.Description, input.Price, sessionID)
	if err != nil {
		// Menambahkan log error agar terlihat di terminal jika ada masalah lain
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate sesi: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sesi berhasil diperbarui"})
}