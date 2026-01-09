package helpers

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "secret123"
	hash, err := HashPassword(password)
	
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	
	if hash == "" {
		t.Error("HashPassword returned empty string")
	}
	
	if hash == password {
		t.Error("HashPassword returned the plain password")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "secret123"
	hash, _ := HashPassword(password)
	
	// Valid password
	if !CheckPassword(hash, password) {
		t.Error("CheckPassword failed for valid password")
	}
	
	// Invalid password
	if CheckPassword(hash, "wrongpassword") {
		t.Error("CheckPassword succeeded for invalid password")
	}
}
