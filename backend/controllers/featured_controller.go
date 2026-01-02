package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
)

// =============================
// GET FEATURED EVENTS (Public)
// =============================
func GetFeaturedEvents(c *gin.Context) {
	type FeaturedEvent struct {
		ID             int64   `db:"id" json:"id"`
		EventID        int64   `db:"event_id" json:"event_id"`
		OrderIndex     int     `db:"order_index" json:"order_index"`
		Title          string  `db:"title" json:"title"`
		Description    *string `db:"description" json:"description"`
		Category       *string `db:"category" json:"category"`
		ThumbnailURL   *string `db:"thumbnail_url" json:"thumbnail_url"`
		OrganizationID int64   `db:"organization_id" json:"organization_id"`
		OrgName        *string `db:"org_name" json:"org_name"`
	}

	var featured []FeaturedEvent
	err := config.DB.Select(&featured, `
		SELECT 
			fe.id, fe.event_id, fe.order_index,
			e.title, e.description, e.category, e.thumbnail_url, e.organization_id,
			o.name as org_name
		FROM featured_events fe
		JOIN events e ON fe.event_id = e.id
		LEFT JOIN organizations o ON e.organization_id = o.id
		WHERE e.publish_status = 'PUBLISHED'
		ORDER BY fe.order_index ASC
		LIMIT 10
	`)

	if err != nil {
		// Table might not exist yet, return empty array
		c.JSON(http.StatusOK, gin.H{"featured": []interface{}{}})
		return
	}

	if featured == nil {
		featured = []FeaturedEvent{}
	}

	c.JSON(http.StatusOK, gin.H{"featured": featured})
}

// =============================
// GET ALL FEATURED (Admin)
// =============================
func AdminGetFeaturedEvents(c *gin.Context) {
	type FeaturedEvent struct {
		ID           int64   `db:"id" json:"id"`
		EventID      int64   `db:"event_id" json:"event_id"`
		OrderIndex   int     `db:"order_index" json:"order_index"`
		Title        string  `db:"title" json:"title"`
		Category     *string `db:"category" json:"category"`
		ThumbnailURL *string `db:"thumbnail_url" json:"thumbnail_url"`
		CreatedAt    string  `db:"created_at" json:"created_at"`
	}

	var featured []FeaturedEvent
	err := config.DB.Select(&featured, `
		SELECT 
			fe.id, fe.event_id, fe.order_index,
			e.title, e.category, e.thumbnail_url, fe.created_at
		FROM featured_events fe
		JOIN events e ON fe.event_id = e.id
		ORDER BY fe.order_index ASC
	`)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"featured": []interface{}{}})
		return
	}

	if featured == nil {
		featured = []FeaturedEvent{}
	}

	c.JSON(http.StatusOK, gin.H{"featured": featured})
}

// =============================
// GET AVAILABLE EVENTS (Admin) - Events not yet featured
// =============================
func AdminGetAvailableEvents(c *gin.Context) {
	type AvailableEvent struct {
		ID           int64   `db:"id" json:"id"`
		Title        string  `db:"title" json:"title"`
		Category     *string `db:"category" json:"category"`
		ThumbnailURL *string `db:"thumbnail_url" json:"thumbnail_url"`
		OrgName      *string `db:"org_name" json:"org_name"`
	}

	var events []AvailableEvent
	err := config.DB.Select(&events, `
		SELECT 
			e.id, e.title, e.category, e.thumbnail_url,
			o.name as org_name
		FROM events e
		LEFT JOIN organizations o ON e.organization_id = o.id
		WHERE e.publish_status = 'PUBLISHED'
		AND e.id NOT IN (SELECT event_id FROM featured_events)
		ORDER BY e.created_at DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events: " + err.Error()})
		return
	}

	if events == nil {
		events = []AvailableEvent{}
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}

// =============================
// ADD TO FEATURED (Admin)
// =============================
func AdminAddFeaturedEvent(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var req struct {
		EventID int64 `json:"event_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Event ID is required"})
		return
	}

	// Check count limit (max 10)
	var count int
	config.DB.Get(&count, `SELECT COUNT(*) FROM featured_events`)
	if count >= 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 10 featured events allowed"})
		return
	}

	// Get next order index
	var maxOrder int
	config.DB.Get(&maxOrder, `SELECT COALESCE(MAX(order_index), 0) FROM featured_events`)

	// Insert
	_, err := config.DB.Exec(`
		INSERT INTO featured_events (event_id, order_index, created_at, created_by)
		VALUES (?, ?, ?, ?)
	`, req.EventID, maxOrder+1, time.Now(), userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add featured event: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event added to featured"})
}

// =============================
// REMOVE FROM FEATURED (Admin)
// =============================
func AdminRemoveFeaturedEvent(c *gin.Context) {
	id := c.Param("id")

	_, err := config.DB.Exec(`DELETE FROM featured_events WHERE id = ?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove featured event"})
		return
	}

	// Reorder remaining
	config.DB.Exec(`
		SET @row_number = 0;
		UPDATE featured_events SET order_index = (@row_number:=@row_number + 1) ORDER BY order_index;
	`)

	c.JSON(http.StatusOK, gin.H{"message": "Event removed from featured"})
}

// =============================
// REORDER FEATURED (Admin)
// =============================
func AdminReorderFeaturedEvents(c *gin.Context) {
	var req struct {
		Order []int64 `json:"order" binding:"required"` // Array of featured_events IDs in new order
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order array is required"})
		return
	}

	// Update order for each
	for idx, id := range req.Order {
		config.DB.Exec(`UPDATE featured_events SET order_index = ? WHERE id = ?`, idx+1, id)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated"})
}

// =============================
// UPDATE FEATURED ORDER (Admin) - Move single item
// =============================
func AdminUpdateFeaturedOrder(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		OrderIndex int `json:"order_index" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order index is required"})
		return
	}

	idInt, _ := strconv.ParseInt(id, 10, 64)

	_, err := config.DB.Exec(`UPDATE featured_events SET order_index = ? WHERE id = ?`, req.OrderIndex, idInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated"})
}
