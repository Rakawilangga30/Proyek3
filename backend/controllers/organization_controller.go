package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
)

// =============================
// USER APPLY ORGANIZATION
// =============================

type ApplyOrganizationRequest struct {
	OrgName        string `json:"org_name" binding:"required"`
	OrgDescription string `json:"org_description"`
	OrgCategory    string `json:"org_category"`
	OrgLogoURL     string `json:"org_logo_url"`

	OrgEmail   string `json:"org_email"`
	OrgPhone   string `json:"org_phone"`
	OrgWebsite string `json:"org_website"`

	Reason      string `json:"reason" binding:"required"`
	SocialMedia string `json:"social_media"`
}

func ApplyOrganization(c *gin.Context) {
	userID := c.GetInt64("user_id")

	// 1. Check if user already has a pending application
	var count int
	config.DB.Get(&count,
		"SELECT COUNT(*) FROM organization_applications WHERE user_id = ? AND status = 'PENDING'",
		userID,
	)

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You already have a pending application"})
		return
	}

	// 2. Bind JSON request
	var req ApplyOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// 3. Insert into database
	_, err := config.DB.Exec(`
		INSERT INTO organization_applications 
		(user_id, org_name, org_description, org_category, org_logo_url, 
		 org_email, org_phone, org_website, reason, social_media, submitted_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		userID,
		req.OrgName,
		req.OrgDescription,
		req.OrgCategory,
		req.OrgLogoURL,
		req.OrgEmail,
		req.OrgPhone,
		req.OrgWebsite,
		req.Reason,
		req.SocialMedia,
		time.Now(),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit application"})
		return
	}

	// 4. Return success
	c.JSON(http.StatusOK, gin.H{
		"message": "Organization application submitted successfully",
	})
}

// =======================================
// UPDATE EVENT (Title, Desc, Category)
// =======================================
func UpdateEvent(c *gin.Context) {
	// 1. Get ID from param and user_id from token
	// Supports both parameter names just in case
	eventIDStr := c.Param("id")
	if eventIDStr == "" {
		eventIDStr = c.Param("eventID")
	}

	userID := c.GetInt64("user_id")

	var eventID int64
	if _, err := fmt.Sscan(eventIDStr, &eventID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// 2. Check Event Ownership
	// Ensure this event belongs to the organization owned by this user
	var count int
	err := config.DB.Get(&count, `
		SELECT COUNT(*) 
		FROM events e
		JOIN organizations o ON e.organization_id = o.id
		WHERE e.id = ? AND o.owner_user_id = ?
	`, eventID, userID)

	if err != nil || count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to edit this event"})
		return
	}

	// 3. Bind Input JSON
	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Category    string `json:"category"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 4. Perform Update
	// Only update relevant fields. Publish status is not changed here.
	_, err = config.DB.Exec(`
		UPDATE events 
		SET title = ?, description = ?, category = ?, updated_at = ?
		WHERE id = ?
	`, input.Title, input.Description, input.Category, time.Now(), eventID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event updated successfully",
		"data":    input,
	})
}

// =======================================
// UPLOAD EVENT THUMBNAIL
// =======================================
func UploadEventThumbnail(c *gin.Context) {
	// 1. Get Event ID
	eventIDStr := c.Param("id")
	if eventIDStr == "" {
		eventIDStr = c.Param("eventID")
	}

	userID := c.GetInt64("user_id")

	var eventID int64
	if _, err := fmt.Sscan(eventIDStr, &eventID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// 2. Check Ownership
	var count int
	err := config.DB.Get(&count, `
		SELECT COUNT(*) FROM events e
		JOIN organizations o ON e.organization_id = o.id
		WHERE e.id = ? AND o.owner_user_id = ?
	`, eventID, userID)

	if err != nil || count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to edit this event"})
		return
	}

	// 3. Get File from Form
	file, err := c.FormFile("thumbnail")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Thumbnail file is required"})
		return
	}

	// Validate Extension (Images Only)
	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only jpg, jpeg, and png allowed"})
		return
	}

	// 4. Save File
	// Create folder if it doesn't exist
	saveDir := "uploads/events"
	if _, err := os.Stat(saveDir); os.IsNotExist(err) {
		os.MkdirAll(saveDir, 0755)
	}

	// Filename format: event_thumb_{id}_{timestamp}.jpg
	filename := fmt.Sprintf("event_thumb_%d_%d%s", eventID, time.Now().Unix(), ext)
	savePath := filepath.Join(saveDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save thumbnail image"})
		return
	}

	// 5. Update Database
	// Convert path separator to forward slash for URL consistency
	dbPath := "uploads/events/" + filename

	_, err = config.DB.Exec("UPDATE events SET thumbnail_url = ? WHERE id = ?", dbPath, eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Thumbnail updated successfully",
		"thumbnail_url": dbPath,
	})
}

// Request Structure for Session
type CreateSessionRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Price       int64  `json:"price"`
}

// =======================================
// ORGANIZATION: CREATE SESSION
// =======================================
func CreateSession(c *gin.Context) {
	eventID := c.Param("eventID")

	userID := c.GetInt64("user_id")
	orgID, err := getOrganizationIDByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization"})
		return
	}

	// Check event ownership
	var count int
	config.DB.Get(&count, "SELECT COUNT(*) FROM events WHERE id = ? AND organization_id = ?", eventID, orgID)
	if count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Event not found or access denied"})
		return
	}

	var req CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var maxOrder int
	config.DB.Get(&maxOrder, "SELECT COALESCE(MAX(order_index), 0) FROM sessions WHERE event_id = ?", eventID)

	res, err := config.DB.Exec(`
		INSERT INTO sessions (event_id, title, description, price, order_index, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
		eventID, req.Title, req.Description, req.Price, maxOrder+1, time.Now(),
	)

	if err != nil {
		fmt.Println("❌ Error Create Session:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	sessionID, _ := res.LastInsertId()
	c.JSON(http.StatusOK, gin.H{"message": "Session created!", "session_id": sessionID})
}

// // ==========================================
// // STRUCT KHUSUS UNTUK RESPONSE DASHBOARD
// // ==========================================
// type SessionVideoResponse struct {
// 	ID       int64  `db:"id" json:"id"`
// 	Title    string `db:"title" json:"title"`
// 	VideoURL string `db:"video_url" json:"video_url"`
// }

// type SessionFileResponse struct {
// 	ID      int64  `db:"id" json:"id"`
// 	Title   string `db:"title" json:"title"`
// 	FileURL string `db:"file_url" json:"file_url"`
// }

// type SessionWithMedia struct {
// 	ID            int64                  `db:"id" json:"id"`
// 	EventID       int64                  `db:"event_id" json:"event_id"`
// 	Title         string                 `db:"title" json:"title"`
// 	Description   string                 `db:"description" json:"description"`
// 	Price         int                    `db:"price" json:"price"`
// 	PublishStatus string                 `db:"publish_status" json:"publish_status"`
// 	Videos        []SessionVideoResponse `json:"videos"`
// 	Files         []SessionFileResponse  `json:"files"`
// }

// // ==========================================
// // GET EVENT DETAIL (FOR MANAGE - ORGANIZER)
// // ==========================================
// func GetMyEventDetailForManage(c *gin.Context) {
// 	eventIDStr := c.Param("eventID")
// 	if eventIDStr == "" {
// 		eventIDStr = c.Param("id")
// 	}
	
// 	userID := c.GetInt64("user_id")

// 	// 1. Cek Kepemilikan Event
// 	var event models.Event
// 	err := config.DB.Get(&event, `
// 		SELECT e.* FROM events e
// 		JOIN organizations o ON e.organization_id = o.id
// 		WHERE e.id = ? AND o.owner_user_id = ?
// 	`, eventIDStr, userID)

// 	if err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan atau akses ditolak"})
// 		return
// 	}

// 	// 2. Ambil Daftar Sesi
// 	var sessions []SessionWithMedia
// 	err = config.DB.Select(&sessions, `
// 		SELECT id, event_id, title, description, price, publish_status 
// 		FROM sessions 
// 		WHERE event_id = ? 
// 		ORDER BY order_index ASC, created_at ASC
// 	`, event.ID)

// 	if err != nil {
// 		// Jika tidak ada sesi, jangan error, tapi return array kosong
// 		sessions = []SessionWithMedia{}
// 	}

// 	// 3. Ambil Video dan File untuk SETIAP Sesi
// 	// (Looping query ini sederhana & cukup cepat untuk jumlah sesi wajar)
// 	for i := range sessions {
// 		// Ambil Video
// 		var videos []SessionVideoResponse
// 		config.DB.Select(&videos, "SELECT id, title, video_url FROM session_videos WHERE session_id = ? ORDER BY order_index ASC", sessions[i].ID)
// 		if videos == nil { videos = []SessionVideoResponse{} }
// 		sessions[i].Videos = videos

// 		// Ambil File
// 		var files []SessionFileResponse
// 		config.DB.Select(&files, "SELECT id, title, file_url FROM session_files WHERE session_id = ? ORDER BY order_index ASC", sessions[i].ID)
// 		if files == nil { files = []SessionFileResponse{} }
// 		sessions[i].Files = files
// 	}

// 	// 4. Kirim Response Lengkap
// 	c.JSON(http.StatusOK, gin.H{
// 		"event":    event,
// 		"sessions": sessions,
// 	})
// }