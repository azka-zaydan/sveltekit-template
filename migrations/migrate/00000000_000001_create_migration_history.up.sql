-- Migration: create_migration_history
-- Created: [timestamp]
-- Schema: public

CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_migration_history_name ON migration_history(name);
CREATE INDEX IF NOT EXISTS idx_migration_history_type ON migration_history(type);
