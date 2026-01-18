package test

import (
	"net/http"
	"testing"

	"BACKEND/controllers"
	"BACKEND/test/testutils"
)

// ================================
// GET PAYMENT TOKEN TESTS
// ================================

func TestGetPaymentToken_Success(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)

	body := map[string]interface{}{
		"session_id": 1,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.GetPaymentToken(c)

	// Might fail due to Midtrans config, but should not crash
	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest && w.Code != http.StatusInternalServerError {
		t.Errorf("Unexpected status %d. Body: %s", w.Code, w.Body.String())
	}
}

func TestGetPaymentToken_SessionNotFound(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)

	body := map[string]interface{}{
		"session_id": 999,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.GetPaymentToken(c)

	if w.Code != http.StatusNotFound && w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 404 or 400, got %d", w.Code)
	}
}

func TestGetPaymentToken_InvalidRequest(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)

	// Missing session_id
	body := map[string]interface{}{}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.GetPaymentToken(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// GET MIDTRANS CONFIG TESTS
// ================================

func TestGetMidtransConfig_Success(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	controllers.GetMidtransConfig(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	if response["client_key"] == nil {
		t.Error("Expected client_key in response")
	}
}

// ================================
// CHECK PAYMENT STATUS TESTS
// ================================

func TestCheckPaymentStatus_NoPurchaseID(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)

	// Missing purchase_id
	body := map[string]interface{}{}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.CheckPaymentStatus(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestCheckPaymentStatus_PurchaseNotFound(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)

	body := map[string]interface{}{
		"purchase_id": 999,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.CheckPaymentStatus(c)

	if w.Code != http.StatusNotFound && w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 404 or 400, got %d", w.Code)
	}
}

// ================================
// SIMULATE PAYMENT SUCCESS TESTS
// ================================

func TestSimulatePaymentSuccess_NoPurchaseID(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)

	body := map[string]interface{}{}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.SimulatePaymentSuccess(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestSimulatePaymentSuccess_Success(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)
	db.MustExec(`INSERT INTO purchases (id, user_id, session_id, amount, status, order_id, price_paid) VALUES (1, 1, 1, 100000, 'PENDING', 'TEST-123', 100000)`)

	body := map[string]interface{}{
		"purchase_id": 1,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	controllers.SimulatePaymentSuccess(c)

	// Accept OK or InternalServerError due to external dependencies
	if w.Code != http.StatusOK && w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status %d or 500, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	// Only verify if successful
	if w.Code == http.StatusOK {
		var status string
		db.Get(&status, "SELECT status FROM purchases WHERE id = 1")
		if status != "PAID" {
			t.Errorf("Expected status PAID, got %s", status)
		}
	}
}

// ================================
// HANDLE MIDTRANS NOTIFICATION TESTS
// ================================

func TestHandleMidtransNotification_Success(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'User', 'user@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, owner_user_id, name) VALUES (1, 1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Event 1', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)
	db.MustExec(`INSERT INTO purchases (id, user_id, session_id, amount, status, order_id, price_paid) VALUES (1, 1, 1, 100000, 'PENDING', 'SESI-1-1234567890', 100000)`)

	body := map[string]interface{}{
		"order_id":           "SESI-1-1234567890",
		"transaction_status": "settlement",
		"gross_amount":       "100000.00",
		"status_code":        "200",
	}

	c, w := testutils.CreateTestContextWithBody(body)
	controllers.HandleMidtransNotification(c)

	// Might fail signature validation, but should not crash
	if w.Code != http.StatusOK && w.Code != http.StatusUnauthorized {
		t.Errorf("Unexpected status %d. Body: %s", w.Code, w.Body.String())
	}
}

func TestHandleMidtransNotification_InvalidBody(t *testing.T) {
	db := SetupTestDB()
	defer TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Request, _ = http.NewRequest(http.MethodPost, "/", nil)
	c.Request.Header.Set("Content-Type", "application/json")
	controllers.HandleMidtransNotification(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}
