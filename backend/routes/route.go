package routes

import (
	"BACKEND/controllers"
	"BACKEND/middlewares"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {

	api := r.Group("/api")

	// ========================
	// AUTH ROUTES
	// ========================
	api.POST("/register", controllers.Register)
	api.POST("/login", controllers.Login)

	// ========================
	// USER PROFILE ROUTES
	// ========================
	user := api.Group("/user")
	user.Use(middlewares.AuthRequired())

	user.GET("/profile", controllers.GetMe)
	user.PUT("/profile", controllers.UpdateMe)
	user.POST("/profile/upload-image", controllers.UploadProfileImage)
	user.PUT("/profile/change-password", controllers.ChangePassword)

	// ========================
	// APPLY ORGANIZATION (USER ONLY)
	// ========================
	api.POST("/organization/apply",
		middlewares.AuthRequired(),
		middlewares.RoleOnly("USER"),
		controllers.ApplyOrganization,
	)

	// ========================
	// ORGANIZATION ROUTES
	// ========================
	org := api.Group("/organization")
	org.Use(middlewares.AuthRequired(), middlewares.OrganizationOnly())

	org.GET("/profile", controllers.GetOrganizationProfile)
	org.PUT("/profile", controllers.UpdateOrganizationProfile)

	org.POST("/events", controllers.CreateEvent)
	org.GET("/events", controllers.ListMyEvents)
	// Sesi
	org.POST("/events/:eventID/sessions", controllers.CreateSession)
	// Upload materi ke sesi
	org.POST("/sessions/:sessionID/videos", controllers.UploadSessionVideo)
	org.POST("/sessions/:sessionID/files", controllers.UploadSessionFile)
	
	org.GET("/sessions/:sessionID/media", controllers.GetSessionMedia)
	// Publish / unpublish / schedule event
	org.PUT("/events/:id/publish", controllers.PublishEvent)
	org.PUT("/events/:id/unpublish", controllers.UnpublishEvent)
	org.PUT("/events/:id/schedule", controllers.SchedulePublish)
	// Publish / unpublish / schedule session
	org.PUT("/sessions/:sessionID/publish", controllers.PublishSession)
	org.PUT("/sessions/:sessionID/unpublish", controllers.UnpublishSession)
	org.PUT("/sessions/:sessionID/schedule", controllers.ScheduleSessionPublish)

	// PUBLIC: List all published event
	api.GET("/events", controllers.ListPublicEvents)


	// ===========================
	// PUBLIC EVENT DETAIL
	// ===========================
	api.GET("/events/:eventID", controllers.GetEventDetail)
	



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
}
