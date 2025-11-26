package models

type User struct {
	ID           int64  `db:"id"`
	Name         string `db:"name"`
	Email        string `db:"email"`
	PasswordHash string `db:"password_hash"`
	Password     string `json:"password" db:"-"`
}
