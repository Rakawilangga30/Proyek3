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

	userID := c.GetInt64("user_id")

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
