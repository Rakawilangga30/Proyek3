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
	// USER ROUTES
	// ========================
	user := api.Group("/user")
	user.Use(middlewares.AuthRequired())

	// Profile
	user.GET("/profile", controllers.GetMe)
	user.PUT("/profile", controllers.UpdateMe)
	user.POST("/profile/upload-image", controllers.UploadProfileImage)
	user.PUT("/profile/change-password", controllers.ChangePassword)

	// Pembelian sesi
	user.POST("/buy/:sessionID", controllers.BuySession)
	user.GET("/purchases", controllers.MyPurchases)

	// LIST MEDIA (video & file metadata)
	user.GET("/sessions/:sessionID/media",
		middlewares.SessionAccessRequired(),
		controllers.GetSessionMedia,
	)

	// ===============================
	// SIGNED URL GENERATORS
	// ===============================
	user.GET("/sessions/signed-video/:filename", controllers.GetSignedVideoURL)
	user.GET("/sessions/signed-file/:filename", controllers.GetSignedFileURL)

	// ===============================
	// STREAMING (VIDEO + FILE)
	// ===============================
	user.GET("/sessions/video/:filename",
		middlewares.AuthRequired(),
		controllers.StreamSessionVideo,
	)

	user.GET("/sessions/file/:filename",
		middlewares.AuthRequired(),
		controllers.StreamSessionFile,
	)

	// ========================
	// APPLY ORGANIZATION
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

	// profile
	org.GET("/profile", controllers.GetOrganizationProfile)
	org.PUT("/profile", controllers.UpdateOrganizationProfile)

	// Event
	org.POST("/events", controllers.CreateEvent)
	org.GET("/events", controllers.ListMyEvents)

	// Sessions
	org.POST("/events/:eventID/sessions", controllers.CreateSession)

	// Upload materi
	org.POST("/sessions/:sessionID/videos", controllers.UploadSessionVideo)
	org.POST("/sessions/:sessionID/files", controllers.UploadSessionFile)

	// Ambil media
	org.GET("/sessions/:sessionID/media", controllers.GetSessionMedia)

	// EVENT publish
	org.PUT("/events/:id/publish", controllers.PublishEvent)
	org.PUT("/events/:id/unpublish", controllers.UnpublishEvent)
	org.PUT("/events/:id/schedule", controllers.SchedulePublish)

	// SESSION publish
	org.PUT("/sessions/:sessionID/publish", controllers.PublishSession)
	org.PUT("/sessions/:sessionID/unpublish", controllers.UnpublishSession)
	org.PUT("/sessions/:sessionID/schedule", controllers.ScheduleSessionPublish)

	// PUBLIC EVENT LISTING
	api.GET("/events", controllers.ListPublicEvents)

	// PUBLIC EVENT DETAIL
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
