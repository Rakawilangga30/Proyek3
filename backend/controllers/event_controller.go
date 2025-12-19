package controllers

import (
	"fmt"
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

// ==========================================
// GET MY EVENT DETAIL (Halaman Manage)
// ==========================================
func GetMyEventDetailForManage(c *gin.Context) {
	eventID := c.Param("eventID")
	userID := c.GetInt64("user_id")

	// 1. Cari dulu Organization ID milik User ini
	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		fmt.Println("❌ Error: User ini tidak punya organisasi")
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda belum terdaftar sebagai creator"})
		return
	}

	// 2. Ambil Data Event (Pastikan Event ini milik Org ID tersebut)
	var event models.Event
	// Kita sebutkan kolom satu per satu agar aman & gunakan COALESCE untuk field yg mungkin NULL
	err = config.DB.Get(&event, `
		SELECT 
			id, organization_id, title, description, category, thumbnail_url, 
			COALESCE(publish_status, 'DRAFT') as publish_status, 
			publish_at, created_at, updated_at
		FROM events 
		WHERE id = ? AND organization_id = ?
	`, eventID, orgID)

	if err != nil {
		fmt.Println("❌ Error DB Event:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan atau bukan milik Anda"})
		return
	}

	// 3. Ambil Daftar Sesi
	var sessions []models.Session
	err = config.DB.Select(&sessions, `
		SELECT 
			id, event_id, title, description, price, order_index, 
			COALESCE(publish_status, 'DRAFT') as publish_status, 
			publish_at, created_at
		FROM sessions 
		WHERE event_id = ?
		ORDER BY order_index ASC
	`, eventID)

	if err != nil {
		sessions = []models.Session{} // Jangan error, return array kosong saja
	}

	c.JSON(http.StatusOK, gin.H{
		"event":    event,
		"sessions": sessions,
	})
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
		INSERT INTO events (organization_id, title, description, category, publish_status, created_at, updated_at)
		VALUES (?, ?, ?, ?, 'DRAFT', ?, ?)
	`, orgID, req.Title, req.Description, req.Category, time.Now(), time.Now())
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	eventID, _ := res.LastInsertId()
	c.JSON(http.StatusOK, gin.H{"message": "Event created successfully", "event_id": eventID})
}

// =======================================
// ORGANIZATION: LIST MY EVENTS
// =======================================
func ListMyEvents(c *gin.Context) {
	userID := c.GetInt64("user_id")

	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization not found"})
		return
	}

	var events []models.Event
	err = config.DB.Select(&events, `
		SELECT 
			id, organization_id, title, description, category, thumbnail_url, 
			COALESCE(publish_status, 'DRAFT') as publish_status, 
			publish_at, created_at, updated_at 
		FROM events 
		WHERE organization_id = ?
		ORDER BY created_at DESC
	`, orgID)

	if err != nil {
		events = []models.Event{}
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}