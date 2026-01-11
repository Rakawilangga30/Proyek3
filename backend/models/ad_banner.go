package models

import "time"

// AdBanner represents an advertisement banner
type AdBanner struct {
	ID         int64      `db:"id" json:"id"`
	Title      string     `db:"title" json:"title"`
	ImageURL   string     `db:"image_url" json:"image_url"`
	TargetURL  *string    `db:"target_url" json:"target_url"`
	Placement  string     `db:"placement" json:"placement"` // HOME_SLIDER, SIDEBAR, FOOTER
	StartDate  *time.Time `db:"start_date" json:"start_date"`
	EndDate    *time.Time `db:"end_date" json:"end_date"`
	IsActive   bool       `db:"is_active" json:"is_active"`
	OrderIndex int        `db:"order_index" json:"order_index"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	CreatedBy  *int64     `db:"created_by" json:"created_by"`
}
