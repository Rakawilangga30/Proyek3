package main

import (
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"

    "BACKEND/config"
    "BACKEND/routes"
)

func main() {
    // load .env
    godotenv.Load()

    r := gin.Default()

    config.ConnectDB()
    config.SetupCORS(r)

    routes.RegisterRoutes(r)

    r.Run(":8080")
}
