package controllers

import (
	"net/http"
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

	// 1. Check apakah user sudah pernah mengajukan
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
