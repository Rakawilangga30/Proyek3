package controllers

import (
	"fmt"
	"net/http"
	"BACKEND/config"
	"BACKEND/models"
	"github.com/gin-gonic/gin"
)

// Struct respon ringkas
type PublicEventResponse struct {
	ID               int64   `db:"id" json:"id"`
	Title            string  `db:"title" json:"title"`
	Description      string  `db:"description" json:"description"`
	Category         string  `db:"category" json:"category"`
	ThumbnailURL     *string `db:"thumbnail_url" json:"thumbnail_url"`
	OrganizationName string  `db:"organization_name" json:"organization_name"`
	SessionCount     int     `db:"session_count" json:"session_count"`
	MinPrice         float64 `db:"min_price" json:"min_price"`
	PublishAt        *string `db:"publish_at" json:"publish_at"`
}

// =========================================================
// GET ALL PUBLIC EVENTS
// =========================================================
func ListPublicEvents(c *gin.Context) {
	// Base Query
	baseQuery := `
		SELECT 
			e.id, e.title, e.description, e.category, e.thumbnail_url,
			o.name AS organization_name,
			(SELECT COUNT(*) FROM sessions s WHERE s.event_id = e.id) AS session_count,
			(SELECT COALESCE(MIN(price), 0) FROM sessions s WHERE s.event_id = e.id) AS min_price,
			e.publish_at
		FROM events e
		JOIN organizations o ON o.id = e.organization_id
	`

	// 1. PUBLISHED
	var publishedEvents []PublicEventResponse
	config.DB.Select(&publishedEvents, baseQuery+" WHERE e.publish_status = 'PUBLISHED' ORDER BY e.created_at DESC")
	if publishedEvents == nil { publishedEvents = []PublicEventResponse{} }

	// 2. UPCOMING (SCHEDULED)
	var upcomingEvents []PublicEventResponse
	config.DB.Select(&upcomingEvents, baseQuery+" WHERE e.publish_status = 'SCHEDULED' ORDER BY e.publish_at ASC")
	if upcomingEvents == nil { upcomingEvents = []PublicEventResponse{} }

	c.JSON(http.StatusOK, gin.H{
		"events":   publishedEvents,
		"upcoming": upcomingEvents,
	})
}

// =========================
// GET EVENT DETAIL (PUBLIC)
// =========================
func GetEventDetail(c *gin.Context) {
	eventID := c.Param("eventID")

	// 1. Ambil Event (Izinkan PUBLISHED atau SCHEDULED)
	var event models.Event
	err := config.DB.Get(&event, `
		SELECT 
			id, organization_id, title, description, category, thumbnail_url,
			COALESCE(publish_status, 'DRAFT') as publish_status, 
			publish_at, created_at, updated_at
		FROM events 
		WHERE id = ? AND (publish_status = 'PUBLISHED' OR publish_status = 'SCHEDULED')
	`, eventID)

	if err != nil {
		fmt.Println("❌ Public Event Error:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan atau belum rilis"})
		return
	}

	// 2. Ambil Sesi (Hanya yang tidak DRAFT)
	var sessions []models.Session
	err = config.DB.Select(&sessions, `
		SELECT 
			id, event_id, title, description, price, order_index, 
			COALESCE(publish_status, 'DRAFT') as publish_status, 
			publish_at, created_at
		FROM sessions
		WHERE event_id = ? AND publish_status != 'DRAFT'
		ORDER BY order_index ASC
	`, eventID)

	if err != nil {
		sessions = []models.Session{}
	}

	c.JSON(http.StatusOK, gin.H{
		"event":    event,
		"sessions": sessions,
	})
}