package models

type User struct {
	ID           int64  `db:"id" json:"id"`
	Name         string `db:"name" json:"name"`
	Email        string `db:"email" json:"email"`
	PasswordHash string `db:"password_hash" json:"-"`

	Phone      string `db:"phone" json:"phone"`
	ProfileImg string `db:"profile_img" json:"profile_img"`
	Bio        string `db:"bio" json:"bio"`
	Username   string `db:"username" json:"username"`
}
