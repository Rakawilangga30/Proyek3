package config

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func SetupCORS(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		// Izinkan akses dari semua origin
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		// PENTING: Handle request OPTIONS (Preflight)
		// Browser akan mengirim request OPTIONS dulu sebelum POST/PUT
		// Jika tidak di-handle, browser akan memblokir request aslinya.
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})
}