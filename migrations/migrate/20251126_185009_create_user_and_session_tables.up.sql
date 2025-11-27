
-- Create user table in auth schema
CREATE TABLE IF NOT EXISTS auth.user (
	id TEXT PRIMARY KEY,
	age INTEGER,
	username TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL
);

-- Create session table in auth schema
CREATE TABLE IF NOT EXISTS auth.session (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
	expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_user_id ON auth.session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON auth.session(expires_at);

