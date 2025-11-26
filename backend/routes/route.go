package routes

import (
	"github.com/gin-gonic/gin"

	"BACKEND/controllers"
	"BACKEND/middlewares"
)

func RegisterRoutes(r *gin.Engine) {

	api := r.Group("/api")

	// ========================
	// AUTH ROUTES
	// ========================
	api.POST("/register", controllers.Register)
	api.POST("/login", controllers.Login)

	// ========================
	// USER PROTECTED ROUTES
	// ========================
	protected := api.Group("/")
	protected.Use(middlewares.AuthRequired())

	// user profile sendiri
	protected.GET("/me", controllers.GetMe)
	protected.PUT("/me", controllers.UpdateMe)

	// ========================
	// ADMIN ROUTES
	// ========================
	admin := api.Group("/admin")
	admin.Use(middlewares.AuthRequired(), middlewares.AdminOnly())

	admin.GET("/users", controllers.GetAllUsers)
	admin.GET("/users/:id", controllers.GetUserByID)
	admin.PUT("/users/:id", controllers.UpdateUserByAdmin)
	admin.DELETE("/users/:id", controllers.DeleteUser)
	admin.POST("/users", controllers.CreateUserByAdmin)

	// ========================
	// ORGANIZATION ROUTES 
	// (nanti akan ditambahkan)
	// ========================
	org := api.Group("/organization")
	org.Use(middlewares.AuthRequired(), middlewares.OrganizationOnly())

	// contoh (nanti tambah di sini):
	// org.POST("/apply", controllers.ApplyOrganization)
}
