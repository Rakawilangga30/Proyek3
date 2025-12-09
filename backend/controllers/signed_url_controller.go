package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"BACKEND/helpers" // Pastikan import ini ada
)

func GetSignedVideoURL(c *gin.Context) {
	userID := c.GetInt64("user_id") // Ambil User ID
	filename := c.Param("filename")

	// GUNAKAN HELPER INI, JANGAN UUID
	token, exp := helpers.GenerateSignedToken(userID, filename)

	// Masukkan uid ke dalam URL agar controller stream tau siapa yang nonton
	signedURL := fmt.Sprintf("/api/user/sessions/video/%s?token=%s&exp=%d&uid=%d", 
		filename, token, exp, userID)

	c.JSON(200, gin.H{"url": signedURL})
}

func GetSignedFileURL(c *gin.Context) {
	userID := c.GetInt64("user_id")
	filename := c.Param("filename")

	token, exp := helpers.GenerateSignedToken(userID, filename)

	signedURL := fmt.Sprintf("/api/user/sessions/file/%s?token=%s&exp=%d&uid=%d", 
		filename, token, exp, userID)

	c.JSON(200, gin.H{"url": signedURL})
}