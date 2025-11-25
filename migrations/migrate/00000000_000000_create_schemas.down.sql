-- Rollback migration: create_schemas
-- Created: [timestamp]
-- Schema: public

-- Drop schemas (cascade to drop all tables within them)
DROP SCHEMA IF EXISTS app CASCADE;
DROP SCHEMA IF EXISTS master CASCADE;
DROP SCHEMA IF EXISTS auth CASCADE;
