package controllers

import (
	"net/http"
	"testing"

	"BACKEND/test"
	"BACKEND/test/testutils"

	"github.com/gin-gonic/gin"
)

// ================================
// GET MY NOTIFICATIONS TESTS
// ================================

func TestGetMyNotifications_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user and notifications
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (1, 1, 'info', 'Test Title', 'Test Message', 0)`)
	db.MustExec(`INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (2, 1, 'alert', 'Alert', 'Alert Message', 1)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetMyNotifications(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	notifications, ok := response["notifications"].([]interface{})
	if !ok {
		t.Error("Expected notifications array in response")
		return
	}
	if len(notifications) != 2 {
		t.Errorf("Expected 2 notifications, got %d", len(notifications))
	}

	unreadCount, ok := response["unread_count"].(float64)
	if !ok || unreadCount != 1 {
		t.Errorf("Expected unread_count 1, got %v", response["unread_count"])
	}
}

func TestGetMyNotifications_Empty(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetMyNotifications(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	notifications, ok := response["notifications"].([]interface{})
	if !ok {
		t.Error("Expected notifications array in response")
		return
	}
	if len(notifications) != 0 {
		t.Errorf("Expected 0 notifications, got %d", len(notifications))
	}
}

// ================================
// MARK NOTIFICATION AS READ TESTS
// ================================

func TestMarkNotificationAsRead_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (1, 1, 'info', 'Test', 'Msg', 0)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	c.Params = gin.Params{{Key: "id", Value: "1"}}
	MarkNotificationAsRead(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	// Verify it's marked as read
	var isRead bool
	db.Get(&isRead, "SELECT is_read FROM notifications WHERE id = 1")
	if !isRead {
		t.Error("Notification should be marked as read")
	}
}

// ================================
// MARK ALL NOTIFICATIONS AS READ TESTS
// ================================

func TestMarkAllNotificationsAsRead_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (1, 1, 'info', 'Test1', 'Msg1', 0)`)
	db.MustExec(`INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (2, 1, 'info', 'Test2', 'Msg2', 0)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	MarkAllNotificationsAsRead(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	// Verify all are marked as read
	var unreadCount int
	db.Get(&unreadCount, "SELECT COUNT(*) FROM notifications WHERE user_id = 1 AND is_read = 0")
	if unreadCount != 0 {
		t.Errorf("Expected 0 unread, got %d", unreadCount)
	}
}

// ================================
// CREATE NOTIFICATION TESTS
// ================================

func TestCreateNotification_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	err := CreateNotification(1, "test", "Test Title", "Test Message")
	if err != nil {
		t.Errorf("CreateNotification failed: %v", err)
	}

	// Verify notification was created
	var count int
	db.Get(&count, "SELECT COUNT(*) FROM notifications WHERE user_id = 1")
	if count != 1 {
		t.Errorf("Expected 1 notification, got %d", count)
	}
}
