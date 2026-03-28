-- DailyThrive migration: create log_entries table
-- Stores completed planner items and manual log entries for each user

CREATE TABLE IF NOT EXISTS log_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  notes TEXT,
  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);