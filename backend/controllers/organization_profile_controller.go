package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
	"BACKEND/models"
)

// =======================================
// ORGANIZATION: GET PROFILE
// =======================================
func GetOrganizationProfile(c *gin.Context) {

	// Read user_id from context robustly
	var userID int64
	if v, ok := c.Get("user_id"); ok {
		switch t := v.(type) {
		case int64:
			userID = t
		case int:
			userID = int64(t)
		case float64:
			userID = int64(t)
		default:
			userID = 0
		}
	}

	var org models.Organization

	err := config.DB.Get(&org, `
		SELECT * FROM organizations WHERE owner_user_id = ?
	`, userID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization profile not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"organization": org})
}

// =======================================
// ORGANIZATION: UPDATE PROFILE
// =======================================

type UpdateOrgProfileRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
	LogoURL     string `json:"logo_url"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Website     string `json:"website"`
	SocialLink  string `json:"social_link"`
	Address     string `json:"address"`
}

func UpdateOrganizationProfile(c *gin.Context) {

	userID := c.GetInt64("user_id")

	var req UpdateOrgProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	_, err := config.DB.Exec(`
		UPDATE organizations 
		SET name = ?, 
			description = ?, 
			category = ?, 
			logo_url = ?, 
			email = ?, 
			phone = ?, 
			website = ?,
			social_link = ?,
			address = ?
		WHERE owner_user_id = ?
	`,
		req.Name,
		req.Description,
		req.Category,
		req.LogoURL,
		req.Email,
		req.Phone,
		req.Website,
		req.SocialLink,
		req.Address,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Organization profile updated successfully",
	})
}

// =======================================
// ORGANIZATION: REPORT (TOTAL EVENT + BUYERS PER EVENT)
// =======================================
func GetOrganizationReport(c *gin.Context) {
	userID := c.GetInt64("user_id")

	// 1. Ambil org id milik user
	var orgID int64
	err := config.DB.Get(&orgID, `SELECT id FROM organizations WHERE owner_user_id = ?`, userID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Organization not found"})
		return
	}

	// 2. Total events
	var total int
	config.DB.Get(&total, `SELECT COUNT(*) FROM events WHERE organization_id = ?`, orgID)

	// 3. Detail events with buyer counts (distinct users who purchased any session of the event)
	type EventStat struct {
		ID           int64   `db:"id" json:"id"`
		Title        string  `db:"title" json:"title"`
		ThumbnailURL *string `db:"thumbnail_url" json:"thumbnail_url"`
		Buyers       int     `db:"buyers" json:"buyers"`
		CreatedAt    string  `db:"created_at" json:"created_at"`
	}

	var events []EventStat
	query := `
		SELECT e.id, e.title, e.thumbnail_url, e.created_at,
			(SELECT COUNT(DISTINCT p.user_id) FROM purchases p JOIN sessions s ON p.session_id = s.id WHERE s.event_id = e.id) AS buyers
		FROM events e
		WHERE e.organization_id = ?
		ORDER BY e.created_at DESC
	`
	config.DB.Select(&events, query, orgID)

	if events == nil {
		events = []EventStat{}
	}

	c.JSON(200, gin.H{"total_events": total, "events": events})
}
