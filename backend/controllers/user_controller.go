package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"BACKEND/config"
	"BACKEND/models"
)

// ================================
// GET PROFILE USER SENDIRI
// ================================
func GetMe(c *gin.Context) {
	// Read user_id from context robustly (support int/int64/float64)
	var userID int64
	if v, ok := c.Get("user_id"); ok {
		switch t := v.(type) {
		case int64:
			userID = t
		case int:
			userID = int64(t)
		case float64:
			userID = int64(t)
		default:
			userID = 0
		}
	}

	var user models.User
	var err error
	var success bool = false

	// Try 1: Query with all columns (bio and username)
	err = config.DB.Get(&user,
		`SELECT id, name, email, COALESCE(phone, '') as phone, 
		        COALESCE(profile_img, '') as profile_img, 
		        COALESCE(bio, '') as bio, 
		        COALESCE(username, '') as username
		 FROM users WHERE id = ?`,
		userID,
	)
	if err == nil {
		success = true
	}

	// Try 2: WITHOUT bio, WITH username (in case bio column doesn't exist)
	if !success {
		err = config.DB.Get(&user,
			`SELECT id, name, email, COALESCE(phone, '') as phone, 
			        COALESCE(profile_img, '') as profile_img, 
			        COALESCE(username, '') as username
			 FROM users WHERE id = ?`,
			userID,
		)
		if err == nil {
			success = true
			user.Bio = ""
		}
	}

	// Try 3: WITH bio, WITHOUT username (in case username column doesn't exist)
	if !success {
		err = config.DB.Get(&user,
			`SELECT id, name, email, COALESCE(phone, '') as phone, 
			        COALESCE(profile_img, '') as profile_img, 
			        COALESCE(bio, '') as bio
			 FROM users WHERE id = ?`,
			userID,
		)
		if err == nil {
			success = true
			user.Username = ""
		}
	}

	// Try 4: WITHOUT bio AND username
	if !success {
		err = config.DB.Get(&user,
			`SELECT id, name, email, COALESCE(phone, '') as phone, 
			        COALESCE(profile_img, '') as profile_img
			 FROM users WHERE id = ?`,
			userID,
		)
		if err == nil {
			success = true
			user.Bio = ""
			user.Username = ""
		}
	}

	// Try 5: Minimal query - just basic info
	if !success {
		err = config.DB.Get(&user,
			`SELECT id, name, email FROM users WHERE id = ?`,
			userID,
		)
		if err == nil {
			success = true
			user.Phone = ""
			user.ProfileImg = ""
			user.Bio = ""
			user.Username = ""
		}
	}

	if !success {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// ================================
// UPDATE PROFILE USER SENDIRI
// ================================
type UpdateMeRequest struct {
	Name       string `json:"name"`
	Phone      string `json:"phone"`
	ProfileImg string `json:"profile_img"`
	Bio        string `json:"bio"`
	Username   string `json:"username"`
}

func UpdateMe(c *gin.Context) {
	// Read user_id from context robustly (support int/int64/float64)
	var userID int64
	if v, ok := c.Get("user_id"); ok {
		switch t := v.(type) {
		case int64:
			userID = t
		case int:
			userID = int64(t)
		case float64:
			userID = int64(t)
		default:
			userID = 0
		}
	}

	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req UpdateMeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Log the update request
	println("UpdateMe called for user:", userID)
	println("Request data - Name:", req.Name, "Phone:", req.Phone, "Username:", req.Username)

	var err error
	var success bool = false

	// Try 1: Update with all fields (bio and username)
	_, err = config.DB.Exec(`
		UPDATE users 
		SET name = ?, phone = ?, profile_img = ?, bio = ?, username = ?
		WHERE id = ?
	`, req.Name, req.Phone, req.ProfileImg, req.Bio, req.Username, userID)

	if err == nil {
		success = true
		println("Update succeeded with all fields")
	} else {
		println("Try 1 failed (bio+username):", err.Error())
	}

	// Try 2: WITHOUT bio, WITH username (in case bio column doesn't exist)
	if !success {
		_, err = config.DB.Exec(`
			UPDATE users 
			SET name = ?, phone = ?, profile_img = ?, username = ?
			WHERE id = ?
		`, req.Name, req.Phone, req.ProfileImg, req.Username, userID)

		if err == nil {
			success = true
			println("Update succeeded without bio, with username")
		} else {
			println("Try 2 failed (no bio, with username):", err.Error())
		}
	}

	// Try 3: WITH bio, WITHOUT username (in case username column doesn't exist)
	if !success {
		_, err = config.DB.Exec(`
			UPDATE users 
			SET name = ?, phone = ?, profile_img = ?, bio = ?
			WHERE id = ?
		`, req.Name, req.Phone, req.ProfileImg, req.Bio, userID)

		if err == nil {
			success = true
			println("Update succeeded with bio, without username")
		} else {
			println("Try 3 failed (with bio, no username):", err.Error())
		}
	}

	// Try 4: WITHOUT bio AND username
	if !success {
		_, err = config.DB.Exec(`
			UPDATE users 
			SET name = ?, phone = ?, profile_img = ?
			WHERE id = ?
		`, req.Name, req.Phone, req.ProfileImg, userID)

		if err == nil {
			success = true
			println("Update succeeded without bio and username")
		} else {
			println("Try 4 failed (no bio, no username):", err.Error())
		}
	}

	// Try 5: Minimal update - just name and phone
	if !success {
		_, err = config.DB.Exec(`
			UPDATE users 
			SET name = ?, phone = ?
			WHERE id = ?
		`, req.Name, req.Phone, userID)

		if err == nil {
			success = true
			println("Update succeeded with minimal fields")
		} else {
			println("Try 5 failed (minimal):", err.Error())
		}
	}

	if !success {
		println("All update attempts failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile: " + err.Error()})
		return
	}

	println("Profile updated successfully for user:", userID)
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// ================================
// ADMIN: GET ALL USERS (WITH ROLES)
// ================================
func GetAllUsers(c *gin.Context) {
	// Kita buat struct custom untuk response agar ada field Roles
	type UserWithRole struct {
		models.User
		Roles []string `json:"roles"`
	}

	// 1. Ambil semua user
	var users []models.User
	err := config.DB.Select(&users, `
        SELECT id, name, email, phone, profile_img, bio 
        FROM users ORDER BY id DESC
    `)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// 2. Ambil semua roles mapping (agar efisien, sekali query)
	type UserRoleMap struct {
		UserID   int64  `db:"user_id"`
		RoleName string `db:"role_name"`
	}
	var roleMaps []UserRoleMap
	config.DB.Select(&roleMaps, `
        SELECT ur.user_id, r.name as role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
    `)

	// 3. Gabungkan data User + Role
	var result []UserWithRole

	for _, u := range users {
		// Cari role untuk user ini
		var myRoles []string
		for _, rm := range roleMaps {
			if rm.UserID == u.ID {
				myRoles = append(myRoles, rm.RoleName)
			}
		}

		// Append ke hasil akhir
		result = append(result, UserWithRole{
			User:  u,
			Roles: myRoles,
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": result})
}

// ================================
// ADMIN: GET USER BY ID
// ================================
func GetUserByID(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	err := config.DB.Get(&user,
		`SELECT id, name, email, phone, profile_img, bio 
		 FROM users WHERE id = ?`,
		id,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// ================================
// ADMIN: UPDATE USER
// ================================
type AdminUpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Bio   string `json:"bio"`
}

func UpdateUserByAdmin(c *gin.Context) {
	id := c.Param("id")

	var req AdminUpdateUserRequest
	if c.ShouldBindJSON(&req) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	_, err := config.DB.Exec(`
		UPDATE users 
		SET name=?, email=?, phone=?, bio=?
		WHERE id=?
	`, req.Name, req.Email, req.Phone, req.Bio, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// ================================
// ADMIN: DELETE USER
// ================================
func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	// Hapus relasi role
	config.DB.Exec("DELETE FROM user_roles WHERE user_id=?", id)

	_, err := config.DB.Exec("DELETE FROM users WHERE id=?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// ================================
// ADMIN: CREATE NEW USER
// ================================
type AdminCreateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func CreateUserByAdmin(c *gin.Context) {
	var req AdminCreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Cek duplikasi email
	var count int
	config.DB.Get(&count, "SELECT COUNT(*) FROM users WHERE email=?", req.Email)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Insert user
	res, err := config.DB.Exec(`
		INSERT INTO users (name, email, password_hash)
		VALUES (?, ?, ?)
	`, req.Name, req.Email, string(hash))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	userID, _ := res.LastInsertId()

	// Role mapping
	var roleID int
	switch req.Role {
	case "ADMIN":
		roleID = 3
	case "ORGANIZATION":
		roleID = 2
	default:
		roleID = 1
	}

	// Assign role
	_, err = config.DB.Exec(`
		INSERT INTO user_roles (user_id, role_id)
		VALUES (?, ?)
	`, userID, roleID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User created successfully",
		"user_id": userID,
		"role":    req.Role,
	})
}
