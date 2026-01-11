package models

import "time"

// Cart represents a user's shopping cart
type Cart struct {
	ID            int64     `db:"id" json:"id"`
	UserID        int64     `db:"user_id" json:"user_id"`
	AffiliateCode *string   `db:"affiliate_code" json:"affiliate_code"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time `db:"updated_at" json:"updated_at"`
}

// CartItem represents an item in the cart
type CartItem struct {
	ID        int64     `db:"id" json:"id"`
	CartID    int64     `db:"cart_id" json:"cart_id"`
	ItemType  string    `db:"item_type" json:"item_type"` // SESSION or EVENT_PACKAGE
	SessionID *int64    `db:"session_id" json:"session_id"`
	EventID   *int64    `db:"event_id" json:"event_id"`
	Price     float64   `db:"price" json:"price"`
	AddedAt   time.Time `db:"added_at" json:"added_at"`
}

// CartItemDetail includes item details for display
type CartItemDetail struct {
	CartItem
	ItemTitle    string  `db:"item_title" json:"item_title"`
	EventTitle   string  `db:"event_title" json:"event_title"`
	ThumbnailURL *string `db:"thumbnail_url" json:"thumbnail_url"`
}

// CartWithItems combines cart with its items
type CartWithItems struct {
	Cart
	Items      []CartItemDetail `json:"items"`
	TotalPrice float64          `json:"total_price"`
}
