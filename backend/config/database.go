package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/jmoiron/sqlx"
	_ "github.com/go-sql-driver/mysql"
)

var DB *sqlx.DB

func ConnectDB() {
	godotenv.Load()

	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	host := os.Getenv("DB_HOST")
	name := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true", user, pass, host, name)

	var err error
	DB, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}

	fmt.Println("✅ Database connected!")
}