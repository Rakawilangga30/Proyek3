package controllers

import (
	"net/http"
	"testing"

	"BACKEND/test"
	"BACKEND/test/testutils"
)

// ================================
// APPLY AFFILIATE TESTS
// ApplyAffiliate expects JSON body with "motivation" field
// ================================

func TestApplyAffiliate_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	body := map[string]interface{}{
		"motivation": "I want to be an affiliate",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	ApplyAffiliate(c)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusCreated, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["message"] == nil {
		t.Error("Expected message in response")
	}
}

func TestApplyAffiliate_AlreadyApplied(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user and existing application
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_applications (id, user_id, motivation, status) VALUES (1, 1, 'Test', 'PENDING')`)

	body := map[string]interface{}{
		"motivation": "I want to be an affiliate again",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	ApplyAffiliate(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestApplyAffiliate_InvalidRequest(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Set("user_id", int64(1))
	// No JSON body
	ApplyAffiliate(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// GET MY AFFILIATE APPLICATION TESTS
// ================================

func TestGetMyAffiliateApplication_Exists(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user and affiliate application
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_applications (id, user_id, motivation, status) VALUES (1, 1, 'Test motivation', 'APPROVED')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetMyAffiliateApplication(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["application"] == nil {
		t.Error("Expected application in response")
	}
}

func TestGetMyAffiliateApplication_NotExists(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetMyAffiliateApplication(c)

	// Controller returns 404 when no application exists
	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
	}
}

// ================================
// GET AFFILIATE DASHBOARD TESTS
// GetAffiliateDashboard just returns stats, always 200
// ================================

func TestGetAffiliateDashboard_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetAffiliateDashboard(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["stats"] == nil {
		t.Error("Expected stats in response")
	}
}

// ================================
// GET AFFILIATE EVENTS TESTS
// ================================

func TestGetAffiliateEvents_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Setup user and submissions
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_submissions (id, user_id, event_title, event_price, status) 
		VALUES (1, 1, 'Test Event', 100000, 'APPROVED')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetAffiliateEvents(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["events"] == nil {
		t.Error("Expected events array in response")
	}
}

func TestGetAffiliateEvents_Empty(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetAffiliateEvents(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

// ================================
// GET AFFILIATE BALANCE TESTS
// GetAffiliateBalance always returns 200 with balance info
// ================================

func TestGetAffiliateBalance_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_balances (id, user_id, total_earned, total_withdrawn, balance) 
		VALUES (1, 1, 150000, 50000, 100000)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetAffiliateBalance(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["balance"] == nil {
		t.Error("Expected balance in response")
	}
}

func TestGetAffiliateBalance_NoRecord(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetAffiliateBalance(c)

	// Returns 200 with zero balance when no record exists
	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

// ================================
// GET WITHDRAWAL HISTORY TESTS
// ================================

func TestGetWithdrawalHistory_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO financial_transactions (id, transaction_type, entity_type, entity_id, amount, description, reference_id) 
		VALUES (1, 'WITHDRAWAL', 'AFFILIATE', 1, 50000, 'Test withdrawal', 'WD-123')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetWithdrawalHistory(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["transactions"] == nil {
		t.Error("Expected transactions array in response")
	}
}

// ================================
// SIMULATE WITHDRAW TESTS
// Requires JSON body with amount, payment_method, account_name, account_number
// ================================

func TestSimulateWithdraw_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_balances (id, user_id, total_earned, total_withdrawn, balance) 
		VALUES (1, 1, 200000, 0, 200000)`)

	body := map[string]interface{}{
		"amount":         50000,
		"payment_method": "BANK",
		"account_name":   "Test User",
		"account_number": "1234567890",
		"bank_name":      "BCA",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	SimulateWithdraw(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["message"] == nil {
		t.Error("Expected success message")
	}
}

func TestSimulateWithdraw_InsufficientBalance(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_balances (id, user_id, total_earned, total_withdrawn, balance) 
		VALUES (1, 1, 10000, 0, 10000)`)

	body := map[string]interface{}{
		"amount":         100000,
		"payment_method": "DANA",
		"account_name":   "Test User",
		"account_number": "081234567890",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	SimulateWithdraw(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestSimulateWithdraw_MinimumAmount(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO affiliate_balances (id, user_id, total_earned, total_withdrawn, balance) 
		VALUES (1, 1, 100000, 0, 100000)`)

	body := map[string]interface{}{
		"amount":         10000, // Below minimum 50000
		"payment_method": "GOPAY",
		"account_name":   "Test User",
		"account_number": "081234567890",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	SimulateWithdraw(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestSimulateWithdraw_MissingFields(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	body := map[string]interface{}{
		"amount": 50000,
		// Missing payment_method, account_name, account_number
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	SimulateWithdraw(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}
