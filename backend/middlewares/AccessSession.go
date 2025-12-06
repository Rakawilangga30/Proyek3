package middlewares

import (
	"net/http"
	"BACKEND/config"

	"github.com/gin-gonic/gin"
)

// Check if user has purchased the session
func SessionAccessRequired() gin.HandlerFunc {
	return func(c *gin.Context) {

		userID := c.GetInt64("user_id")
		sessionID := c.Param("sessionID")

		var count int

		// Check purchase
		err := config.DB.Get(&count, `
			SELECT COUNT(*) FROM purchases 
			WHERE user_id = ? AND session_id = ?
		`, userID, sessionID)

		if err != nil || count == 0 {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You do not have access to this session",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
