package middlewares

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"BACKEND/helpers"
)

func AuthRequired() gin.HandlerFunc {
	jwtSecret := helpers.GetJWTSecret()

	if os.Getenv("JWT_SECRET") == "" {
		fmt.Println("WARNING: JWT_SECRET not set in environment. Using development default secret.")
	}

	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			c.Abort()
			return
		}

		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			details := ""
			if err != nil {
				details = err.Error()
			}
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": details})
			c.Abort()
			return
		}

		// Ambil claims dari token
		claims := token.Claims.(jwt.MapClaims)

		userID := int64(claims["user_id"].(float64))
		role := claims["role"].(string)

		// Simpan dalam context untuk controller
		c.Set("user_id", userID)
		c.Set("role", role)

		c.Next()
	}
}
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetString("role")

		if role != "ADMIN" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access only",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func OrganizationOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetString("role")

		if role != "ORGANIZATION" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Organization access only",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
