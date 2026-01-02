-- Featured Events Table
-- Allows admin to select which events appear in the homepage banner slider
-- Maximum 10 events can be featured

CREATE TABLE IF NOT EXISTS featured_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    order_index INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_featured_event (event_id)
);

-- Add index for ordering
CREATE INDEX idx_featured_order ON featured_events(order_index);
