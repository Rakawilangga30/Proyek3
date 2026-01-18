package controllers

import (
	"net/http"
	"testing"

	"BACKEND/test"
	"BACKEND/test/testutils"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// ================================
// REGISTER TESTS
// ================================

func TestRegister_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	body := map[string]interface{}{
		"name":     "Test User",
		"email":    "test@example.com",
		"password": "password123",
		"phone":    "081234567890",
	}

	c, w := testutils.CreateTestContextWithBody(body)
	Register(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	if response["message"] != "Register success" {
		t.Errorf("Expected message 'Register success', got '%v'", response["message"])
	}

	if response["user_id"] == nil {
		t.Error("Expected user_id in response")
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create first user
	body := map[string]interface{}{
		"name":     "Test User",
		"email":    "duplicate@example.com",
		"password": "password123",
	}

	c, _ := testutils.CreateTestContextWithBody(body)
	Register(c)

	// Try to register with same email
	c2, w2 := testutils.CreateTestContextWithBody(body)
	Register(c2)

	if w2.Code != http.StatusConflict {
		t.Errorf("Expected status %d, got %d", http.StatusConflict, w2.Code)
	}

	response := testutils.GetJSONResponse(w2)
	if response["error"] != "Email already in use" {
		t.Errorf("Expected error 'Email already in use', got '%v'", response["error"])
	}
}

func TestRegister_InvalidRequest(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Empty body
	c, w := testutils.CreateTestContext()
	c.Request, _ = http.NewRequest(http.MethodPost, "/", nil)
	c.Request.Header.Set("Content-Type", "application/json")
	Register(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestRegister_WithOrganization(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	body := map[string]interface{}{
		"name":          "Org Admin",
		"email":         "org@example.com",
		"password":      "password123",
		"phone":         "081234567890",
		"register_type": "organization",
		"org_name":      "Test Organization",
		"org_category":  "Education",
		"bank_name":     "BCA",
		"bank_account":  "1234567890",
	}

	c, w := testutils.CreateTestContextWithBody(body)
	Register(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	if response["org_pending"] != true {
		t.Error("Expected org_pending to be true")
	}
}

// ================================
// LOGIN TESTS
// ================================

func TestLogin_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// First register a user
	regBody := map[string]interface{}{
		"name":     "Login Test User",
		"email":    "login@example.com",
		"password": "password123",
	}
	c1, _ := testutils.CreateTestContextWithBody(regBody)
	Register(c1)

	// Now try to login
	loginBody := map[string]interface{}{
		"email":    "login@example.com",
		"password": "password123",
	}

	c, w := testutils.CreateTestContextWithBody(loginBody)
	Login(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	if response["token"] == nil {
		t.Error("Expected token in response")
	}
	if response["message"] != "Login success" {
		t.Errorf("Expected message 'Login success', got '%v'", response["message"])
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// First register a user
	regBody := map[string]interface{}{
		"name":     "Test User",
		"email":    "wrongpwd@example.com",
		"password": "correctpassword",
	}
	c1, _ := testutils.CreateTestContextWithBody(regBody)
	Register(c1)

	// Try to login with wrong password
	loginBody := map[string]interface{}{
		"email":    "wrongpwd@example.com",
		"password": "wrongpassword",
	}

	c, w := testutils.CreateTestContextWithBody(loginBody)
	Login(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	loginBody := map[string]interface{}{
		"email":    "notexist@example.com",
		"password": "password123",
	}

	c, w := testutils.CreateTestContextWithBody(loginBody)
	Login(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

func TestLogin_InvalidRequest(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Request, _ = http.NewRequest(http.MethodPost, "/", nil)
	c.Request.Header.Set("Content-Type", "application/json")
	Login(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}
