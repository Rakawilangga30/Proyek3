package helpers

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestTokenHelper(t *testing.T) {
	// Set secret key for testing
	os.Setenv("JWT_SECRET", "testsecret")
	secretKey = []byte("testsecret")

	userID := int64(123)
	roles := []string{"USER", "ADMIN"}

	// Test GenerateToken
	tokenString, err := GenerateToken(userID, roles)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	if tokenString == "" {
		t.Fatal("GenerateToken returned empty string")
	}

	// Test ValidateToken (Success)
	claims, err := ValidateToken(tokenString)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected userID %d, got %d", userID, claims.UserID)
	}

	if len(claims.Roles) != 2 {
		t.Errorf("Expected 2 roles, got %d", len(claims.Roles))
	}

	// Test ValidateToken (Invalid)
	_, err = ValidateToken("invalid.token.string")
	if err == nil {
		t.Error("ValidateToken should fail for invalid token")
	}

	// Test Expired Token logic (Manually create expired token)
	expiredClaims := MyCustomClaims{
		UserID: userID,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired
			Issuer:    "proyek3-backend",
		},
	}
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredString, _ := expiredToken.SignedString(secretKey)

	_, err = ValidateToken(expiredString)
	if err == nil {
		t.Error("ValidateToken should fail for expired token")
	}
}
