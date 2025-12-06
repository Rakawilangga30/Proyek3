package helpers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

var SignedSecret = []byte("SUPER_SECRET_CHANGE_THIS")

// Generate signed URL token
func GenerateSignedToken(userID int64, filename string) (string, int64) {

	exp := time.Now().Add(1 * time.Minute).Unix() // expired 1 menit

	data := fmt.Sprintf("%d|%s|%d", userID, filename, exp)

	h := hmac.New(sha256.New, SignedSecret)
	h.Write([]byte(data))

	token := hex.EncodeToString(h.Sum(nil))

	return token, exp
}

// Validate signature
func ValidateSignedToken(userID int64, filename string, exp int64, token string) bool {

	if time.Now().Unix() > exp {
		return false
	}

	data := fmt.Sprintf("%d|%s|%d", userID, filename, exp)

	h := hmac.New(sha256.New, SignedSecret)
	h.Write([]byte(data))

	expected := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(expected), []byte(token))
}
