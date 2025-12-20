package controllers

import (
	
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
	"BACKEND/models"
)

// Helper
func getOrganizationIDByUser(userID int64) (int64, error) {
	var orgID int64
	err := config.DB.Get(&orgID, "SELECT id FROM organizations WHERE owner_user_id = ?", userID)
	return orgID, err
}

// Structs
type SessionVideoResponse struct {
	ID          int64  `db:"id" json:"id"`
	Title       string `db:"title" json:"title"`
	Description string `db:"description" json:"description"`
	VideoURL    string `db:"video_url" json:"video_url"`
}

type SessionFileResponse struct {
	ID          int64  `db:"id" json:"id"`
	Title       string `db:"title" json:"title"`
	Description string `db:"description" json:"description"`
	FileURL     string `db:"file_url" json:"file_url"`
}

type SessionWithMedia struct {
	ID            int64                  `db:"id" json:"id"`
	EventID       int64                  `db:"event_id" json:"event_id"`
	Title         string                 `db:"title" json:"title"`
	Description   string                 `db:"description" json:"description"`
	Price         int                    `db:"price" json:"price"`
	PublishStatus string                 `db:"publish_status" json:"publish_status"`
	Videos        []SessionVideoResponse `json:"videos"`
	Files         []SessionFileResponse  `json:"files"`
}

// GET DETAIL FOR MANAGE
func GetMyEventDetailForManage(c *gin.Context) {
	eventID := c.Param("eventID")
	userID := c.GetInt64("user_id")

	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda belum terdaftar sebagai creator"})
		return
	}

	var event models.Event
	err = config.DB.Get(&event, `
		SELECT id, organization_id, title, description, category, thumbnail_url, COALESCE(publish_status, 'DRAFT') as publish_status, publish_at, created_at, updated_at
		FROM events WHERE id = ? AND organization_id = ?
	`, eventID, orgID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	var sessions []SessionWithMedia
	err = config.DB.Select(&sessions, `SELECT id, event_id, title, description, price, COALESCE(publish_status, 'DRAFT') as publish_status FROM sessions WHERE event_id = ? ORDER BY order_index ASC, created_at ASC`, eventID)
	if err != nil { sessions = []SessionWithMedia{} }

	for i := range sessions {
		var videos []SessionVideoResponse
		config.DB.Select(&videos, `SELECT id, title, COALESCE(description, '') as description, video_url FROM session_videos WHERE session_id = ? ORDER BY order_index ASC`, sessions[i].ID)
		if videos == nil { videos = []SessionVideoResponse{} }
		sessions[i].Videos = videos

		var files []SessionFileResponse
		config.DB.Select(&files, `SELECT id, title, COALESCE(description, '') as description, file_url FROM session_files WHERE session_id = ? ORDER BY order_index ASC`, sessions[i].ID)
		if files == nil { files = []SessionFileResponse{} }
		sessions[i].Files = files
	}

	c.JSON(http.StatusOK, gin.H{"event": event, "sessions": sessions})
}

// CREATE EVENT
type CreateEventRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

func CreateEvent(c *gin.Context) {
	userID := c.GetInt64("user_id")
	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization not found"})
		return
	}
	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	res, err := config.DB.Exec(`INSERT INTO events (organization_id, title, description, category, publish_status, created_at, updated_at) VALUES (?, ?, ?, ?, 'DRAFT', ?, ?)`, orgID, req.Title, req.Description, req.Category, time.Now(), time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}
	eventID, _ := res.LastInsertId()
	c.JSON(http.StatusOK, gin.H{"message": "Event created", "event_id": eventID})
}

// LIST MY EVENTS
func ListMyEvents(c *gin.Context) {
	userID := c.GetInt64("user_id")
	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization not found"})
		return
	}
	var events []models.Event
	config.DB.Select(&events, `SELECT id, organization_id, title, description, category, thumbnail_url, COALESCE(publish_status, 'DRAFT') as publish_status, publish_at, created_at, updated_at FROM events WHERE organization_id = ? ORDER BY created_at DESC`, orgID)
	if events == nil { events = []models.Event{} }
	c.JSON(http.StatusOK, gin.H{"events": events})
}

// ==========================================
// DELETE EVENT (FIXED: Full Cleanup)
// ==========================================
func DeleteEvent(c *gin.Context) {
	eventID := c.Param("eventID")
	userID := c.GetInt64("user_id")

	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak"})
		return
	}

	// 1. Ambil Info Thumbnail untuk dihapus nanti
	var thumbnailURL string
	err = config.DB.Get(&thumbnailURL, "SELECT COALESCE(thumbnail_url, '') FROM events WHERE id = ? AND organization_id = ?", eventID, orgID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan atau bukan milik Anda"})
		return
	}

	// 2. Ambil semua Session ID di event ini
	var sessionIDs []int64
	err = config.DB.Select(&sessionIDs, "SELECT id FROM sessions WHERE event_id = ?", eventID)
	
	if err == nil {
		// LOOP SETIAP SESI: Hapus isinya dulu
		for _, sessID := range sessionIDs {
			// A. Hapus Video (File Fisik & DB)
			var videoPaths []string
			config.DB.Select(&videoPaths, "SELECT video_url FROM session_videos WHERE session_id = ?", sessID)
			for _, path := range videoPaths { os.Remove(path) }
			config.DB.Exec("DELETE FROM session_videos WHERE session_id = ?", sessID)

			// B. Hapus Files (File Fisik & DB)
			var filePaths []string
			config.DB.Select(&filePaths, "SELECT file_url FROM session_files WHERE session_id = ?", sessID)
			for _, path := range filePaths { os.Remove(path) }
			config.DB.Exec("DELETE FROM session_files WHERE session_id = ?", sessID)

			// C. Hapus Purchases (DB) - PENTING!
			config.DB.Exec("DELETE FROM purchases WHERE session_id = ?", sessID)
		}

		// 3. Setelah isi sesi kosong, Hapus SEMUA SESI di event ini
		_, err := config.DB.Exec("DELETE FROM sessions WHERE event_id = ?", eventID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus sesi-sesi (DB Error): " + err.Error()})
			return
		}
	}

	// 4. Hapus Thumbnail Event Fisik
	if thumbnailURL != "" {
		os.Remove(thumbnailURL)
	}

	// 5. Akhirnya Hapus Event dari DB
	_, err = config.DB.Exec("DELETE FROM events WHERE id = ? AND organization_id = ?", eventID, orgID)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus event (DB Error): " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event dan semua isinya berhasil dihapus"})
}