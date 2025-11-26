package controllers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"BACKEND/config"
	"BACKEND/helpers"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Cek email sudah ada
	var count int
	if err := config.DB.Get(&count, "SELECT COUNT(*) FROM users WHERE email=?", req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
		return
	}

	// Hash password
	hash, _ := helpers.HashPassword(req.Password)

	// Insert user
	res, err := config.DB.Exec(`
		INSERT INTO users (name, email, password_hash) 
		VALUES (?, ?, ?)
	`, req.Name, req.Email, hash)

	if err != nil {
		log.Println("Insert user error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot create user"})
		return
	}

	userID, _ := res.LastInsertId()

	// Assign role USER (id=1)
	if _, err := config.DB.Exec(`
		INSERT INTO user_roles (user_id, role_id) VALUES (?, 1)
	`, userID); err != nil {
		log.Println("Assign role error:", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Register success",
		"user_id": userID,
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Ambil user
	var user struct {
		ID           int64  `db:"id"`
		Name         string `db:"name"`
		Email        string `db:"email"`
		PasswordHash string `db:"password_hash"`
	}

	if err := config.DB.Get(&user, `
		SELECT id, name, email, password_hash 
		FROM users 
		WHERE email = ?
	`, req.Email); err != nil {
		log.Println("User not found:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email/password"})
		return
	}

	// Cek password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		log.Println("Password mismatch:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email/password"})
		return
	}

	// Ambil role user
	var role string
	if err := config.DB.Get(&role, `
		SELECT r.name 
		FROM roles r 
		JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = ?
	`, user.ID); err != nil {
		log.Println("Role fetch error:", err)
		role = "USER" // fallback aman
	}

	// Generate token
	token, err := helpers.GenerateToken(user.ID, role)
	if err != nil {
		log.Println("Token error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login success",
		"token":   token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
		"role": role,
	})
}
