package controllers

import (
	"net/http"
	"testing"

	"BACKEND/test"
	"BACKEND/test/testutils"

	"github.com/gin-gonic/gin"
)

// ================================
// GET CART TESTS
// ================================

func TestGetCart_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create user and organization for event
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)

	// Create cart with item
	db.MustExec(`INSERT INTO carts (id, user_id) VALUES (1, 1)`)
	db.MustExec(`INSERT INTO cart_items (id, cart_id, item_type, session_id, price) VALUES (1, 1, 'SESSION', 1, 100000)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetCart(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	response := testutils.GetJSONResponse(w)
	if response["items"] == nil {
		t.Error("Expected items array in response")
	}
}

func TestGetCart_Empty(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetCart(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	if response["items"] == nil {
		t.Error("Expected items array in response")
	}
}

func TestGetCart_CreatesCartIfNotExists(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	GetCart(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	if response["cart_id"] == nil {
		t.Error("Expected cart_id in response")
	}
}

// ================================
// ADD TO CART TESTS
// ================================

func TestAddToCart_Session(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)

	sessionID := int64(1)
	body := map[string]interface{}{
		"session_id": sessionID,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	AddToCart(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestAddToCart_SessionNotFound(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	sessionID := int64(999)
	body := map[string]interface{}{
		"session_id": sessionID,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	AddToCart(c)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
	}
}

func TestAddToCart_AlreadyPurchased(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)
	db.MustExec(`INSERT INTO purchases (id, user_id, session_id, amount, status) VALUES (1, 1, 1, 100000, 'PAID')`)

	sessionID := int64(1)
	body := map[string]interface{}{
		"session_id": sessionID,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	AddToCart(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestAddToCart_AlreadyInCart(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)
	db.MustExec(`INSERT INTO carts (id, user_id) VALUES (1, 1)`)
	db.MustExec(`INSERT INTO cart_items (id, cart_id, item_type, session_id, price) VALUES (1, 1, 'SESSION', 1, 100000)`)

	sessionID := int64(1)
	body := map[string]interface{}{
		"session_id": sessionID,
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	AddToCart(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestAddToCart_MissingInput(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	body := map[string]interface{}{}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	AddToCart(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// REMOVE FROM CART TESTS
// ================================

func TestRemoveFromCart_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)
	db.MustExec(`INSERT INTO carts (id, user_id) VALUES (1, 1)`)
	db.MustExec(`INSERT INTO cart_items (id, cart_id, item_type, session_id, price) VALUES (1, 1, 'SESSION', 1, 100000)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	c.Params = gin.Params{{Key: "id", Value: "1"}}
	RemoveFromCart(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestRemoveFromCart_NotFound(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO carts (id, user_id) VALUES (1, 1)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	c.Params = gin.Params{{Key: "id", Value: "999"}}
	RemoveFromCart(c)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
	}
}

// ================================
// CLEAR CART TESTS
// ================================

func TestClearCart_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO sessions (id, event_id, title, price, publish_status) VALUES (1, 1, 'Session 1', 100000, 'PUBLISHED')`)
	db.MustExec(`INSERT INTO carts (id, user_id, affiliate_code) VALUES (1, 1, 'TEST123')`)
	db.MustExec(`INSERT INTO cart_items (id, cart_id, item_type, session_id, price) VALUES (1, 1, 'SESSION', 1, 100000)`)

	c, w := testutils.CreateTestContextWithUserID(1)
	ClearCart(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

// ================================
// CLEAR AFFILIATE CODE TESTS
// ================================

func TestClearAffiliateCode_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO carts (id, user_id, affiliate_code) VALUES (1, 1, 'TEST123')`)

	c, w := testutils.CreateTestContextWithUserID(1)
	ClearAffiliateCode(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

// ================================
// APPLY AFFILIATE CODE TESTS
// ================================

func TestApplyAffiliateCode_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Setup user, affiliate, and partnership
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (2, 'Affiliate', 'aff@test.com', 'hash')`)
	db.MustExec(`INSERT INTO organizations (id, user_id, name) VALUES (1, 1, 'Test Org')`)
	db.MustExec(`INSERT INTO events (id, organization_id, title, publish_status) VALUES (1, 1, 'Test Event', 'PUBLISHED')`)
	db.MustExec(`INSERT INTO affiliates (id, user_id, affiliate_code, status) VALUES (1, 2, 'AFF123', 'APPROVED')`)
	db.MustExec(`INSERT INTO affiliate_partnerships (id, affiliate_id, event_id, unique_code, commission_percentage, status, is_active) 
		VALUES (1, 1, 1, 'PROMO123', 10, 'APPROVED', 1)`)

	body := map[string]interface{}{
		"code": "PROMO123",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	ApplyAffiliateCode(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestApplyAffiliateCode_InvalidCode(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	body := map[string]interface{}{
		"code": "INVALID123",
	}

	c, w := testutils.CreateTestContextWithUserAndBody(1, body)
	ApplyAffiliateCode(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}
