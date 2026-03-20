-- DailyThrive migration: create planner_entries table
-- Stores workout plans and appointments for each user

CREATE TABLE IF NOT EXISTS planner_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);