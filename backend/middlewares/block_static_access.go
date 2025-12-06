package middlewares

import "github.com/gin-gonic/gin"

// Blok akses langsung ke file upload (agar tidak bisa akses /uploads/... langsung).
func BlockStaticAccess() gin.HandlerFunc {
	return func(c *gin.Context) {

		// Jika user mencoba akses folder uploads langsung → tolak
		if len(c.Request.URL.Path) >= 8 && c.Request.URL.Path[:8] == "/uploads" {
			c.JSON(403, gin.H{"error": "Direct access blocked"})
			c.Abort()
			return
		}

		c.Next()
	}
}
