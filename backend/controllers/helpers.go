package controllers

import (
	"BACKEND/config"
)

// Shared helper: check whether a session is owned by the organization of the user
func checkSessionOwnedByUser(sessionID int64, userID int64) bool {
	var count int
	err := config.DB.Get(&count, `
        SELECT COUNT(*) FROM sessions s
        JOIN events e ON s.event_id = e.id
        JOIN organizations o ON e.organization_id = o.id
        WHERE s.id = ? AND o.owner_user_id = ?
    `, sessionID, userID)

	return err == nil && count > 0
}
