package controllers

import (
	"net/http"

	"BACKEND/config"
	"BACKEND/models"

	"github.com/gin-gonic/gin"
)

// =========================
// GET EVENT DETAIL (PUBLIC)
// =========================
func GetEventDetail(c *gin.Context) {

	eventID := c.Param("eventID")

	// Ambil event
	var event models.Event
	err := config.DB.Get(&event, `
        SELECT id, organization_id, title, description, category, thumbnail_url, 
               is_published, created_at 
        FROM events 
        WHERE id = ?
    `, eventID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Ambil sesi
	var sessions []models.SessionSummary
	err = config.DB.Select(&sessions, `
        SELECT id, title, price, order_index
        FROM sessions
        WHERE event_id = ?
        ORDER BY order_index ASC
    `, eventID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load sessions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"event":    event,
		"sessions": sessions,
	})
}

type PublicEventResponse struct {
	ID               int64   `db:"id" json:"id"`
	Title            string  `db:"title" json:"title"`
	Category         string  `db:"category" json:"category"`
	ThumbnailURL     *string `db:"thumbnail_url" json:"thumbnail_url"`
	OrganizationName string  `db:"organization_name" json:"organization_name"`
	SessionCount     int     `db:"session_count" json:"session_count"`
	MinPrice         float64 `db:"min_price" json:"min_price"`
	PublishAt        *string `db:"publish_at" json:"publish_at"`
}

// ===============================
// GET ALL PUBLIC PUBLISHED EVENTS
// ===============================
func ListPublicEvents(c *gin.Context) {

	category := c.Query("category") // optional filter

	query := `
		SELECT 
			e.id,
			e.title,
			e.category,
			e.thumbnail_url,
			o.name AS organization_name,
			(SELECT COUNT(*) FROM sessions s WHERE s.event_id = e.id) AS session_count,
			(SELECT COALESCE(MIN(price), 0) FROM sessions s WHERE s.event_id = e.id) AS min_price,
			e.publish_at
		FROM events e
		JOIN organizations o ON o.id = e.organization_id
		WHERE e.publish_status = 'PUBLISHED'
	`

	params := []interface{}{}

	if category != "" {
		query += " AND e.category = ?"
		params = append(params, category)
	}

	query += " ORDER BY e.publish_at DESC"

	var events []PublicEventResponse
	err := config.DB.Select(&events, query, params...)

	if err != nil {
		// log and return error details to help debugging
		c.JSON(500, gin.H{"error": "Failed to fetch events", "details": err.Error()})
		return
	}

	c.JSON(200, gin.H{"events": events})
}
