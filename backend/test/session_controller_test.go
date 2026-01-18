package test

import (
	"net/http"
	"testing"

	"BACKEND/controllers"
	"BACKEND/test/testutils"

	"github.com/gin-gonic/gin"
)

// ================================
// UPDATE SESSION TESTS
// ================================

func TestUpdateSession_Success(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Org User', 'org@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'DRAFT')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Old Title', 50000, 'DRAFT')`)

	body := map[string]interface{}{
		"title":       "New Title",
		"description": "Updated description",
		"price":       100000,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	c.Params = gin.Params{{Key: "sessionID", Value: "1"}}
	controllers.UpdateSession(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestUpdateSession_Forbidden(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User 1', 'user1@test.com', 'hash')`)
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (2, 'User 2', 'user2@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'DRAFT')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 50000, 'DRAFT')`)

	body := map[string]interface{}{
		"title": "Hacked Title",
	}

	// User 2 tries to update User 1's session
	c, w := testutils.CreateTestContextWithUserAndBody(2, body)
	c.Params = gin.Params{{Key: "sessionID", Value: "1"}}
	controllers.UpdateSession(c)

	if w.Code != http.StatusForbidden {
		t.Errorf("Expected status %d, got %d", http.StatusForbidden, w.Code)
	}
}

func TestUpdateSession_InvalidID(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)

	body := map[string]interface{}{
		"title": "Title",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	c.Params = gin.Params{{Key: "sessionID", Value: "invalid"}}
	controllers.UpdateSession(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// DELETE SESSION TESTS
// ================================

func TestDeleteSession_Success(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Org User', 'org@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'DRAFT')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 50000, 'DRAFT')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	c.Params = gin.Params{{Key: "sessionID", Value: "1"}}
	controllers.DeleteSession(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	// Verify session is deleted
	var count int
	db.Get(&count, "SELECT COUNT(*) FROM sessions WHERE id = 1")
	if count != 0 {
		t.Error("Session should be deleted")
	}
}

func TestDeleteSession_Forbidden(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User 1', 'user1@test.com', 'hash')`)
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (2, 'User 2', 'user2@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'DRAFT')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 50000, 'DRAFT')`)

	// User 2 tries to delete User 1's session
	c, w := testutils.CreateTestContextWithUserID(2)
	c.Params = gin.Params{{Key: "sessionID", Value: "1"}}
	controllers.DeleteSession(c)

	if w.Code != http.StatusForbidden {
		t.Errorf("Expected status %d, got %d", http.StatusForbidden, w.Code)
	}
}

func TestDeleteSession_WithContent(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Org User', 'org@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'DRAFT')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 50000, 'DRAFT')`)
	db.MustExec(`INSERT INTO session_videos (id, session_id, title, video_url) VALUES (1, 1, 'Video 1', 'test/video.mp4')`)
	db.MustExec(`INSERT INTO session_files (id, session_id, title, file_url) VALUES (1, 1, 'File 1', 'test/file.pdf')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	c.Params = gin.Params{{Key: "sessionID", Value: "1"}}
	controllers.DeleteSession(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	// Verify all are deleted
	var sessionCount, videoCount, fileCount int
	db.Get(&sessionCount, "SELECT COUNT(*) FROM sessions WHERE id = 1")
	db.Get(&videoCount, "SELECT COUNT(*) FROM session_videos WHERE session_id = 1")
	db.Get(&fileCount, "SELECT COUNT(*) FROM session_files WHERE session_id = 1")

	if sessionCount != 0 || videoCount != 0 || fileCount != 0 {
		t.Error("Session and its content should be deleted")
	}
}
