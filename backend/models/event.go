package models

import "time"

type Event struct {
    ID             int64    `db:"id" json:"id"`
    OrganizationID int64    `db:"organization_id" json:"organization_id"`
    Title          string   `db:"title" json:"title"`
    Description    string   `db:"description" json:"description"`
    Category       string   `db:"category" json:"category"`
    ThumbnailURL   *string  `db:"thumbnail_url" json:"thumbnail_url"`
    PublishStatus  string   `db:"publish_status" json:"publish_status"`
    PublishAt      *string  `db:"publish_at" json:"publish_at"`
    CreatedAt      string   `db:"created_at" json:"created_at"`
    UpdatedAt      string   `db:"updated_at" json:"updated_at"`
}


type Session struct {
	ID         int64     `db:"id"`
	EventID    int64     `db:"event_id"`
	Title      string    `db:"title"`
	Description string   `db:"description"`
	Price      int64     `db:"price"`
	OrderIndex int       `db:"order_index"`
	CreatedAt  time.Time `db:"created_at"`
}

type SessionVideo struct {
	ID         int64     `db:"id"`
	SessionID  int64     `db:"session_id"`
	Title      string    `db:"title"`
	VideoURL   string    `db:"video_url"`
	SizeBytes  int64     `db:"size_bytes"`
	OrderIndex int       `db:"order_index"`
	CreatedAt  time.Time `db:"created_at"`
}

type SessionFile struct {
	ID         int64     `db:"id"`
	SessionID  int64     `db:"session_id"`
	Title      string    `db:"title"`
	FileURL    string    `db:"file_url"`
	SizeBytes  int64     `db:"size_bytes"`
	OrderIndex int       `db:"order_index"`
	CreatedAt  time.Time `db:"created_at"`
}