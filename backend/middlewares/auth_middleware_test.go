package middlewares

import (
	"BACKEND/helpers"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAuthMiddleware(t *testing.T) {
	// Setup Gin
	gin.SetMode(gin.TestMode)
	
	// Create a valid token
	userID := int64(999)
	roles := []string{"USER"}
	// We need to ensure we use the same secret key as the app.
	// In helpers/token_helper.go, it reads JWT_SECRET env.
	// We should set it here too or hope it uses default empty if not set?
	// The helper init might have run already. Tests run in same process usually.
	
	// CAUTION: backend/helpers might have initialized secretKey already.
	// Ideally we could set env, but var might be set on init.
	// Use helper to generate.
	token_str, err := helpers.GenerateToken(userID, roles)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	tests := []struct {
		name          string
		token         string
		expectedCode  int
		checkContext  bool
	}{
		{
			name:         "No Token",
			token:        "",
			expectedCode: http.StatusUnauthorized,
			checkContext: false,
		},
		{
			name:         "Invalid Token",
			token:        "Bearer invalidtoken123",
			expectedCode: http.StatusUnauthorized,
			checkContext: false,
		},
		{
			name:         "Valid Token",
			token:        "Bearer " + token_str,
			expectedCode: http.StatusOK,
			checkContext: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			// Set header
			req, _ := http.NewRequest("GET", "/", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", tt.token)
			}
			c.Request = req

			// Middleware
			middleware := AuthRequired()
			middleware(c)

			// Determine if aborted
			if c.Writer.Status() == 401 && tt.expectedCode == 200 {
				t.Errorf("Middleware aborted unexpectedly with 401")
			}
			
			// If we expect 200, we check if specific keys are set
			if tt.checkContext {
				if gotUser, exists := c.Get("user_id"); !exists || gotUser.(int64) != userID {
					t.Errorf("Expected user_id %d, got %v", userID, gotUser)
				}
			}
		})
	}
}
