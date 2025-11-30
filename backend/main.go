package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"

	"BACKEND/config"
	"BACKEND/routes"
)

func startAutoPublishJob() {
	go func() {
		ticker := time.NewTicker(1 * time.Minute) // cek tiap 1 menit
		defer ticker.Stop()

		for range ticker.C {
			// Update semua event yang statusnya SCHEDULED
			// dan waktu publish_at sudah lewat / sama dengan sekarang
			res, err := config.DB.Exec(`
				UPDATE events
				SET publish_status = 'PUBLISHED'
				WHERE publish_status = 'SCHEDULED'
				  AND publish_at IS NOT NULL
				  AND publish_at <= NOW()
			`)
            res2, err2 := config.DB.Exec(`
                    UPDATE sessions
                    SET publish_status = 'PUBLISHED'
                    WHERE publish_status = 'SCHEDULED'
                    AND publish_at <= NOW()
                `)
                if err2 == nil {
                    affected2, _ := res2.RowsAffected()
                    if affected2 > 0 {
                        log.Printf("✅ Auto publish session: %d session(s)\n", affected2)
                    }
                }
			if err != nil {
				log.Println("❌ Auto publish job error:", err)
				continue
			}

			affected, _ := res.RowsAffected()
			if affected > 0 {
				log.Printf("✅ Auto publish: %d event(s) changed to PUBLISHED\n", affected)
			}
		}
	}()
}   




func main() {
	r := gin.Default()

	config.ConnectDB()
	config.SetupCORS(r)

	// Jalankan cron auto publish
	startAutoPublishJob()

	// Register semua route
	routes.RegisterRoutes(r)

	// Start server
	r.Run(":8080")
}
