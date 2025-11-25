-- Migration: create_schemas
-- Created: [timestamp]
-- Schema: public

-- Create database schemas for multi-schema architecture
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS app;
