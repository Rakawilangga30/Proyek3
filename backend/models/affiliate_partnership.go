package models

import "time"

// AffiliatePartnership represents a user joining as affiliate to promote an event
type AffiliatePartnership struct {
	ID                   int64      `db:"id" json:"id"`
	UserID               int64      `db:"user_id" json:"user_id"`
	EventID              int64      `db:"event_id" json:"event_id"`
	OrganizationID       int64      `db:"organization_id" json:"organization_id"`
	UniqueCode           string     `db:"unique_code" json:"unique_code"`
	CommissionPercentage float64    `db:"commission_percentage" json:"commission_percentage"`
	Phone                *string    `db:"phone" json:"phone"`
	BankName             *string    `db:"bank_name" json:"bank_name"`
	BankAccount          *string    `db:"bank_account" json:"bank_account"`
	BankAccountName      *string    `db:"bank_account_name" json:"bank_account_name"`
	SocialMedia          *string    `db:"social_media" json:"social_media"`
	Status               string     `db:"status" json:"status"`
	CreatedAt            time.Time  `db:"created_at" json:"created_at"`
	ApprovedAt           *time.Time `db:"approved_at" json:"approved_at"`
	ApprovedBy           *int64     `db:"approved_by" json:"approved_by"`
}

// AffiliatePartnershipDetail includes extra info for display
type AffiliatePartnershipDetail struct {
	AffiliatePartnership
	UserName   string `db:"user_name" json:"user_name"`
	UserEmail  string `db:"user_email" json:"user_email"`
	EventTitle string `db:"event_title" json:"event_title"`
}
