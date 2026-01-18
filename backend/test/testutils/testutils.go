package testutils

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

func init() {
	// Set gin to test mode
	gin.SetMode(gin.TestMode)
}

// CreateTestContext creates a new gin context for testing
func CreateTestContext() (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest(http.MethodGet, "/", nil)
	return c, w
}

// CreateTestContextWithBody creates context with JSON body
func CreateTestContextWithBody(body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	jsonBytes, _ := json.Marshal(body)
	c.Request, _ = http.NewRequest(http.MethodPost, "/", bytes.NewBuffer(jsonBytes))
	c.Request.Header.Set("Content-Type", "application/json")

	return c, w
}

// CreateTestContextWithFormData creates context with form data
func CreateTestContextWithFormData(data map[string]string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	formData := url.Values{}
	for k, v := range data {
		formData.Set(k, v)
	}

	c.Request, _ = http.NewRequest(http.MethodPost, "/", strings.NewReader(formData.Encode()))
	c.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	c.Request.PostForm = formData

	return c, w
}

// CreateTestContextWithParams creates context with URL parameters
func CreateTestContextWithParams(params gin.Params) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = params
	c.Request, _ = http.NewRequest(http.MethodGet, "/", nil)
	return c, w
}

// CreateTestContextWithUserID creates context with authenticated user
func CreateTestContextWithUserID(userID int64) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_id", userID)
	c.Request, _ = http.NewRequest(http.MethodGet, "/", nil)
	return c, w
}

// CreateTestContextWithUserAndBody creates context with user and JSON body
func CreateTestContextWithUserAndBody(userID int64, body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_id", userID)

	jsonBytes, _ := json.Marshal(body)
	c.Request, _ = http.NewRequest(http.MethodPost, "/", bytes.NewBuffer(jsonBytes))
	c.Request.Header.Set("Content-Type", "application/json")

	return c, w
}

// CreateTestContextWithUserAndFormData creates context with user and form data
func CreateTestContextWithUserAndFormData(userID int64, data map[string]string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_id", userID)

	formData := url.Values{}
	for k, v := range data {
		formData.Set(k, v)
	}

	c.Request, _ = http.NewRequest(http.MethodPost, "/", strings.NewReader(formData.Encode()))
	c.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	c.Request.PostForm = formData

	return c, w
}

// CreateTestContextWithUserParamsAndBody creates context with user, params, and body
func CreateTestContextWithUserParamsAndBody(userID int64, params gin.Params, body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_id", userID)
	c.Params = params

	jsonBytes, _ := json.Marshal(body)
	c.Request, _ = http.NewRequest(http.MethodPost, "/", bytes.NewBuffer(jsonBytes))
	c.Request.Header.Set("Content-Type", "application/json")

	return c, w
}

// CreateTestContextWithMethod creates context with specific HTTP method
func CreateTestContextWithMethod(method string, body interface{}) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	var bodyReader io.Reader
	if body != nil {
		jsonBytes, _ := json.Marshal(body)
		bodyReader = bytes.NewBuffer(jsonBytes)
	}

	c.Request, _ = http.NewRequest(method, "/", bodyReader)
	if body != nil {
		c.Request.Header.Set("Content-Type", "application/json")
	}

	return c, w
}

// GetJSONResponse parses the JSON response from the recorder
func GetJSONResponse(w *httptest.ResponseRecorder) map[string]interface{} {
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	return response
}

// AssertStatusCode checks if the response status code matches expected
func AssertStatusCode(w *httptest.ResponseRecorder, expected int) bool {
	return w.Code == expected
}
