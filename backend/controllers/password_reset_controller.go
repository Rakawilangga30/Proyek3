package controllers

import (
	"BACKEND/config"
	"BACKEND/utils"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ================================
// FORGOT PASSWORD - Request Reset Code
// ================================
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email tidak valid"})
		return
	}

	// Find user by email
	var user struct {
		ID   int64  `db:"id"`
		Name string `db:"name"`
	}
	err := config.DB.Get(&user, "SELECT id, name FROM users WHERE email = ?", req.Email)

	// Always return success for security (don't reveal if email exists)
	if err != nil {
		println("Password reset requested for non-existent email:", req.Email)
		c.JSON(http.StatusOK, gin.H{
			"message": "Jika email terdaftar, Anda akan menerima kode verifikasi.",
		})
		return
	}

	// Generate 6-digit code
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%06d", rand.Intn(1000000))

	// Set expiry to 15 minutes from now
	expiresAt := time.Now().Add(15 * time.Minute)

	// Delete any existing tokens for this user
	config.DB.Exec("DELETE FROM password_reset_tokens WHERE user_id = ?", user.ID)

	// Insert new code
	_, err = config.DB.Exec(`
		INSERT INTO password_reset_tokens (user_id, token, expires_at) 
		VALUES (?, ?, ?)
	`, user.ID, code, expiresAt)

	if err != nil {
		println("Failed to save reset code:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kode"})
		return
	}

	// Send email asynchronously
	go func() {
		err := utils.SendPasswordResetEmail(req.Email, code, user.Name)
		if err != nil {
			println("Failed to send password reset email:", err.Error())
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "Jika email terdaftar, Anda akan menerima kode verifikasi.",
	})
}

// ================================
// VERIFY CODE - Check if code is valid
// ================================
type VerifyCodeRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

func VerifyResetCode(c *gin.Context) {
	var req VerifyCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// Find user by email
	var userID int64
	err := config.DB.Get(&userID, "SELECT id FROM users WHERE email = ?", req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode tidak valid"})
		return
	}

	// Find valid code
	var tokenData struct {
		ID        int64     `db:"id"`
		ExpiresAt time.Time `db:"expires_at"`
		Used      bool      `db:"used"`
	}
	err = config.DB.Get(&tokenData, `
		SELECT id, expires_at, used 
		FROM password_reset_tokens 
		WHERE user_id = ? AND token = ?
	`, userID, req.Code)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode tidak valid"})
		return
	}

	if time.Now().After(tokenData.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode sudah kadaluarsa"})
		return
	}

	if tokenData.Used {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode sudah digunakan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"valid": true, "message": "Kode valid"})
}

// ================================
// RESET PASSWORD - Set New Password with Code
// ================================
type ResetPasswordRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Code            string `json:"code" binding:"required"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

func ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid. Password minimal 6 karakter."})
		return
	}

	// Validate password match
	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password dan konfirmasi tidak cocok"})
		return
	}

	// Find user by email
	var userID int64
	err := config.DB.Get(&userID, "SELECT id FROM users WHERE email = ?", req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode tidak valid"})
		return
	}

	// Find valid code
	var tokenData struct {
		ID        int64     `db:"id"`
		ExpiresAt time.Time `db:"expires_at"`
		Used      bool      `db:"used"`
	}
	err = config.DB.Get(&tokenData, `
		SELECT id, expires_at, used 
		FROM password_reset_tokens 
		WHERE user_id = ? AND token = ?
	`, userID, req.Code)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode tidak valid"})
		return
	}

	if time.Now().After(tokenData.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode sudah kadaluarsa. Silakan minta kode baru."})
		return
	}

	if tokenData.Used {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode sudah digunakan. Silakan minta kode baru."})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password"})
		return
	}

	// Update user password
	_, err = config.DB.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hashedPassword), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate password"})
		return
	}

	// Mark code as used and delete all tokens for this user
	config.DB.Exec("DELETE FROM password_reset_tokens WHERE user_id = ?", userID)

	// Send notification to user
	go CreateNotification(
		userID,
		"password_changed",
		"🔐 Password Berhasil Diubah",
		"Password akun Anda telah berhasil direset. Jika Anda tidak melakukan ini, segera hubungi support.",
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Password berhasil direset! Silakan login dengan password baru.",
	})
}
