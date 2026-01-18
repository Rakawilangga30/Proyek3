package controllers

import (
	"net/http"
	"testing"

	"BACKEND/test"
	"BACKEND/test/testutils"

	"github.com/gin-gonic/gin"
)

// ================================
// GET ME TESTS
// ================================

func TestGetMe_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user with roles
	db.MustExec(`INSERT INTO users (id, name, email, password_hash, phone, bio) VALUES (1, 'Test User', 'test@test.com', 'hash', '08123456', 'My bio')`)
	db.MustExec(`INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetMe(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	user, ok := response["user"].(map[string]interface{})
	if !ok {
		t.Error("Expected user object in response")
		return
	}
	if user["name"] != "Test User" {
		t.Errorf("Expected name 'Test User', got '%v'", user["name"])
	}
	if user["email"] != "test@test.com" {
		t.Errorf("Expected email 'test@test.com', got '%v'", user["email"])
	}
}

func TestGetMe_UserNotFound(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContextWithUserID(999)
	GetMe(c)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
	}
}

func TestGetMe_Unauthorized(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	GetMe(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

// ================================
// UPDATE ME TESTS
// ================================

func TestUpdateMe_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Old Name', 'test@test.com', 'hash')`)

	body := map[string]interface{}{
		"name":  "New Name",
		"phone": "081234567890",
		"bio":   "Updated bio",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	UpdateMe(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["message"] != "Profile updated" {
		t.Errorf("Expected 'Profile updated' message, got '%v'", response["message"])
	}
}

func TestUpdateMe_InvalidRequest(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContextWithUserID(1)
	c.Request, _ = http.NewRequest(http.MethodPut, "/", nil)
	UpdateMe(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// GET ALL USERS TESTS (ADMIN)
// ================================

func TestGetAllUsers_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create multiple users
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User 1', 'user1@test.com', 'hash')`)
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (2, 'User 2', 'user2@test.com', 'hash')`)
	db.MustExec(`INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)`)
	db.MustExec(`INSERT INTO user_roles (user_id, role_id) VALUES (2, 1)`)

	c, w := testutils.CreateTestContext()
	GetAllUsers(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	users, ok := response["users"].([]interface{})
	if !ok {
		t.Error("Expected users array in response")
		return
	}
	if len(users) != 2 {
		t.Errorf("Expected 2 users, got %d", len(users))
	}
}

func TestGetAllUsers_Empty(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	GetAllUsers(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	users, ok := response["users"].([]interface{})
	if !ok {
		t.Error("Expected users array in response")
		return
	}
	if len(users) != 0 {
		t.Errorf("Expected 0 users, got %d", len(users))
	}
}

// ================================
// GET USER BY ID TESTS (ADMIN)
// ================================

func TestGetUserByID_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)`)

	c, w := testutils.CreateTestContext()
	c.Params = gin.Params{{Key: "userId", Value: "1"}}
	GetUserByID(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["user"] == nil {
		t.Error("Expected user in response")
	}
}

func TestGetUserByID_NotFound(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Params = gin.Params{{Key: "userId", Value: "999"}}
	GetUserByID(c)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
	}
}

// ================================
// UPDATE USER BY ADMIN TESTS
// ================================

func TestUpdateUserByAdmin_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Old Name', 'old@test.com', 'hash')`)

	body := map[string]interface{}{
		"name":   "New Name",
		"email":  "new@test.com",
		"phone":  "08123456",
		"reason": "Admin update",
	}

	c, w := testutils.CreateTestContextWithBody(body)
	c.Params = gin.Params{{Key: "userId", Value: "1"}}
	UpdateUserByAdmin(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestUpdateUserByAdmin_InvalidRequest(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Params = gin.Params{{Key: "userId", Value: "1"}}
	c.Request, _ = http.NewRequest(http.MethodPut, "/", nil)
	UpdateUserByAdmin(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// DELETE USER TESTS
// ================================

func TestDeleteUser_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'To Delete', 'del@test.com', 'hash')`)

	c, w := testutils.CreateTestContext()
	c.Params = gin.Params{{Key: "userId", Value: "1"}}
	DeleteUser(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	// Verify user is deleted
	var count int
	db.Get(&count, "SELECT COUNT(*) FROM users WHERE id = 1")
	if count != 0 {
		t.Error("User should be deleted")
	}
}

func TestDeleteUser_NotFound(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Params = gin.Params{{Key: "userId", Value: "999"}}
	DeleteUser(c)

	// Should still return success because DELETE doesn't fail on non-existent
	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}
