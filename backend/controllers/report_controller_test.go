package controllers

import (
	"net/http"
	"testing"

	"BACKEND/test"
	"BACKEND/test/testutils"
)

// ================================
// SUBMIT REPORT TESTS
// ================================

func TestSubmitReport_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Create a user first
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)

	formData := map[string]string{
		"category":    "Bug",
		"subject":     "Test Report",
		"description": "This is a test report description",
	}

	c, w := testutils.CreateTestContextWithUserAndFormData(1, formData)
	SubmitReport(c)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusCreated, w.Code, w.Body.String())
	}
}

func TestSubmitReport_MissingSubject(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	formData := map[string]string{
		"category":    "Bug",
		"description": "Description only",
	}

	c, w := testutils.CreateTestContextWithUserAndFormData(1, formData)
	SubmitReport(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestSubmitReport_MissingDescription(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	formData := map[string]string{
		"category": "Bug",
		"subject":  "Subject only",
	}

	c, w := testutils.CreateTestContextWithUserAndFormData(1, formData)
	SubmitReport(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

// ================================
// GET REPORTS TESTS
// ================================

func TestGetReports_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Insert test data
	db.MustExec(`INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Test User', 'test@test.com', 'hash')`)
	db.MustExec(`INSERT INTO reports (id, user_id, category, subject, description, status) VALUES (1, 1, 'Bug', 'Test Subject', 'Test Desc', 'PENDING')`)

	c, w := testutils.CreateTestContext()
	GetReports(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	response := testutils.GetJSONResponse(w)
	reports, ok := response["reports"].([]interface{})
	if !ok {
		t.Error("Expected reports array in response")
		return
	}
	if len(reports) != 1 {
		t.Errorf("Expected 1 report, got %d", len(reports))
	}
}

func TestGetReports_Empty(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	GetReports(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

// ================================
// UPDATE REPORT STATUS TESTS
// ================================

func TestUpdateReportStatus_Success(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	// Insert test report
	db.MustExec(`INSERT INTO reports (id, category, subject, description, status) VALUES (1, 'Bug', 'Test', 'Desc', 'PENDING')`)

	body := map[string]interface{}{
		"status":      "RESOLVED",
		"admin_notes": "Fixed the issue",
	}

	c, w := testutils.CreateTestContextWithBody(body)
	c.Params = append(c.Params, struct{ Key, Value string }{Key: "id", Value: "1"})

	UpdateReportStatus(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestUpdateReportStatus_InvalidRequest(t *testing.T) {
	db := test.SetupTestDB()
	defer test.TeardownTestDB(db)

	c, w := testutils.CreateTestContext()
	c.Params = append(c.Params, struct{ Key, Value string }{Key: "id", Value: "1"})

	UpdateReportStatus(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}
