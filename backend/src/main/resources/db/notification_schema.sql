-- ============================================================
-- Notification System Database Schema
-- Applied automatically by Hibernate ddl-auto=update
-- For manual migration use this script on PostgreSQL
-- ============================================================

-- Enum types (Postgres native; Hibernate uses VARCHAR so these are informational)
-- CREATE TYPE notification_channel AS ENUM ('SMS', 'WHATSAPP', 'VOICE');
-- CREATE TYPE notification_status  AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING', 'CANCELLED');

-- Main notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id               BIGSERIAL PRIMARY KEY,
    voter_id         BIGINT,
    voter_name       VARCHAR(255),
    recipient_number VARCHAR(20)  NOT NULL,
    channel          VARCHAR(20)  NOT NULL,          -- SMS | WHATSAPP | VOICE
    message          TEXT         NOT NULL,
    message_template VARCHAR(500),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    twilio_sid       VARCHAR(64),
    error_message    TEXT,
    retry_count      INT          NOT NULL DEFAULT 0,
    max_retries      INT          NOT NULL DEFAULT 3,
    next_retry_at    TIMESTAMP,
    sent_at          TIMESTAMP,
    delivered_at     TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    bulk_batch_id    VARCHAR(64),
    priority         INT          NOT NULL DEFAULT 5,

    CONSTRAINT fk_voter FOREIGN KEY (voter_id) REFERENCES voter_profiles(id) ON DELETE SET NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_notif_voter_id    ON notifications(voter_id);
CREATE INDEX IF NOT EXISTS idx_notif_status      ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notif_channel     ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notif_created_at  ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_batch_id    ON notifications(bulk_batch_id);
CREATE INDEX IF NOT EXISTS idx_notif_retry       ON notifications(status, retry_count, next_retry_at)
    WHERE status IN ('FAILED', 'RETRYING');

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();

-- Useful view: notification summary by day
CREATE OR REPLACE VIEW notification_daily_summary AS
SELECT
    DATE(created_at)        AS date,
    channel,
    COUNT(*)                AS total,
    SUM(CASE WHEN status IN ('SENT', 'DELIVERED') THEN 1 ELSE 0 END) AS successful,
    SUM(CASE WHEN status = 'FAILED'               THEN 1 ELSE 0 END) AS failed,
    ROUND(100.0 * SUM(CASE WHEN status IN ('SENT', 'DELIVERED') THEN 1 ELSE 0 END) / COUNT(*), 2) AS success_rate
FROM notifications
GROUP BY DATE(created_at), channel
ORDER BY date DESC, channel;
