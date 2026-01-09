package helpers

import (
	"testing"
	"time"
)

func TestSignedURL(t *testing.T) {
	userID := int64(456)
	filename := "video.mp4"

	// Test GenerateSignedToken
	token, exp := GenerateSignedToken(userID, filename)
	
	if token == "" {
		t.Error("GenerateSignedToken returned empty token")
	}

	if exp <= time.Now().Unix() {
		t.Error("GenerateSignedToken expiration too short or in past")
	}

	// Test ValidateSignedToken (Success)
	if !ValidateSignedToken(userID, filename, exp, token) {
		t.Error("ValidateSignedToken failed for valid token")
	}

	// Test ValidateSignedToken (Expired)
	expiredExp := time.Now().Add(-1 * time.Minute).Unix() // past
	if ValidateSignedToken(userID, filename, expiredExp, token) {
		t.Error("ValidateSignedToken should fail for expired token")
	}

	// Test ValidateSignedToken (Tampered Token)
	if ValidateSignedToken(userID, filename, exp, "tamperedtoken") {
		t.Error("ValidateSignedToken should fail for tampered token")
	}

	// Test ValidateSignedToken (Tampered Data)
	if ValidateSignedToken(userID, "other.mp4", exp, token) {
		t.Error("ValidateSignedToken should fail for tampered data")
	}
}
