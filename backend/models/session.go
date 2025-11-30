package models

type SessionSummary struct {
    ID            int64    `db:"id" json:"id"`
    Title         string   `db:"title" json:"title"`
    Price         float64  `db:"price" json:"price"`
    OrderIndex    int      `db:"order_index" json:"order_index"`
    PublishStatus string   `db:"publish_status" json:"publish_status"`
    PublishAt     *string  `db:"publish_at" json:"publish_at"`
}
