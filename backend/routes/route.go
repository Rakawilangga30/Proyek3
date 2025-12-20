package routes

import (
	"BACKEND/controllers"
	"BACKEND/middlewares"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {

	api := r.Group("/api")

	// ==========================================
	// 1. PUBLIC ROUTES
	// ==========================================
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		api.GET("/events", controllers.ListPublicEvents)
		api.GET("/events/:eventID", controllers.GetEventDetail)
		api.GET("/user/sessions/video/:filename", controllers.StreamSessionVideo)
		api.GET("/user/sessions/file/:filename", controllers.StreamSessionFile)
	}

	// ==========================================
	// 2. USER ROUTES
	// ==========================================
	user := api.Group("/user")
	user.Use(middlewares.AuthRequired()) 
	{
		user.GET("/profile", controllers.GetMe)
		user.PUT("/profile", controllers.UpdateMe)
		user.POST("/profile/upload-image", controllers.UploadProfileImage)
		user.PUT("/profile/change-password", controllers.ChangePassword)

		user.POST("/buy/:sessionID", controllers.BuySession)
		user.GET("/purchases", controllers.MyPurchases)
		user.GET("/sessions/:sessionID/check-purchase", controllers.CheckSessionPurchase)

		user.GET("/sessions/:sessionID/media",
			middlewares.SessionAccessRequired(),
			controllers.GetUserSessionMedia,
		)
		user.GET("/sessions/signed-video/:filename", controllers.GetSignedVideoURL)
		user.GET("/sessions/signed-file/:filename", controllers.GetSignedFileURL)
	}

	// ==========================================
	// 3. APPLY ORG
	// ==========================================
	api.POST("/organization/apply",
		middlewares.AuthRequired(),
		middlewares.RoleOnly("USER"),
		controllers.ApplyOrganization,
	)

	// ==========================================
	// 4. ORGANIZATION ROUTES
	// ==========================================
	org := api.Group("/organization")
	org.Use(middlewares.AuthRequired(), middlewares.OrganizationOnly())
	{
		org.GET("/profile", controllers.GetOrganizationProfile)
		org.PUT("/profile", controllers.UpdateOrganizationProfile)

		org.POST("/events", controllers.CreateEvent)
		org.PUT("/events/:eventID", controllers.UpdateEvent)
		org.DELETE("/events/:eventID", controllers.DeleteEvent) // Delete Event

		org.POST("/events/:eventID/thumbnail", controllers.UploadEventThumbnail)
		org.GET("/events", controllers.ListMyEvents)
		org.GET("/events/:eventID", controllers.GetMyEventDetailForManage) 

		org.PUT("/events/:eventID/publish", controllers.PublishEvent)
		org.PUT("/events/:eventID/unpublish", controllers.UnpublishEvent)
		org.PUT("/events/:eventID/schedule", controllers.SchedulePublish)

		org.POST("/events/:eventID/sessions", controllers.CreateSession)
		org.PUT("/sessions/:sessionID/publish", controllers.PublishSession)
		org.PUT("/sessions/:sessionID/unpublish", controllers.UnpublishSession)
		org.PUT("/sessions/:sessionID/schedule", controllers.ScheduleSessionPublish)
		org.PUT("/sessions/:sessionID", controllers.UpdateSession)
		org.DELETE("/sessions/:sessionID", controllers.DeleteSession) // Delete Session

		// --- MATERI ROUTES ---
		org.POST("/sessions/:sessionID/videos", controllers.UploadSessionVideo)
		org.POST("/sessions/:sessionID/files", controllers.UploadSessionFile)
		
		org.PUT("/sessions/:sessionID/videos/:mediaID", controllers.UpdateSessionVideo)
		org.PUT("/sessions/:sessionID/files/:mediaID", controllers.UpdateSessionFile)
		
		// DELETE MATERI (BARU)
		org.DELETE("/sessions/:sessionID/videos/:mediaID", controllers.DeleteSessionVideo)
		org.DELETE("/sessions/:sessionID/files/:mediaID", controllers.DeleteSessionFile)

		org.GET("/sessions/:sessionID/media", controllers.GetSessionMedia)
	}

	// ==========================================
	// 5. ADMIN ROUTES
	// ==========================================
	admin := api.Group("/admin")
	admin.Use(middlewares.AuthRequired(), middlewares.AdminOnly())
	{
		admin.GET("/users", controllers.GetAllUsers)
		admin.GET("/users/:id", controllers.GetUserByID)
		admin.POST("/users", controllers.CreateUserByAdmin)
		admin.PUT("/users/:id", controllers.UpdateUserByAdmin)
		admin.DELETE("/users/:id", controllers.DeleteUser)
		admin.GET("/organization/applications", controllers.GetAllOrganizationApplications)
		admin.GET("/organization/applications/:id", controllers.GetOrganizationApplicationByID)
		admin.POST("/organization/applications/:id/review", controllers.ReviewOrganizationApplication)
	}
}