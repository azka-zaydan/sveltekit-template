
-- Drop session table first (due to foreign key constraint)
DROP TABLE IF EXISTS auth.session CASCADE;

-- Drop user table
DROP TABLE IF EXISTS auth.user CASCADE;

