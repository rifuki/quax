-- Rollback: Restore tables by dropping the recreated ones
-- This brings back to state before 004_reset_all_tables.up.sql

DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS users CASCADE;
