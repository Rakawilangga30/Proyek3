package models

type UserRole struct {
	UserID int64 `db:"user_id"`
	RoleID int   `db:"role_id"`
}
