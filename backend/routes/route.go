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

	protected.GET("/me", controllers.GetMe)
	protected.PUT("/me", controllers.UpdateMe)

	// ========================
	// APPLY ORGANIZATION (USER ONLY)
	// ========================
	api.POST("/organization/apply",
		middlewares.AuthRequired(),
		middlewares.RoleOnly("USER"),
		controllers.ApplyOrganization,
	)

	// ========================
	// ORGANIZATION ROUTES (AFTER APPROVED)
	// ========================
	org := api.Group("/organization")
	org.Use(middlewares.AuthRequired(), middlewares.OrganizationOnly())

	// nanti di sini:
	// org.GET("/profile", controllers.GetOrganizationProfile)
	// org.PUT("/profile", controllers.UpdateOrganizationProfile)
	// org.POST("/events/create", controllers.CreateEvent)

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
	admin.GET("/organization/applications", controllers.GetAllOrganizationApplications)
	admin.GET("/organization/applications/:id", controllers.GetOrganizationApplicationByID)
	admin.POST("/organization/applications/:id/review", controllers.ReviewOrganizationApplication)



	// nanti admin review organization di sini:
	// admin.GET("/organization/applications", controllers.GetAllOrganizationApplications)
	// admin.POST("/organization/applications/:id/review", controllers.ReviewOrganization)
}
