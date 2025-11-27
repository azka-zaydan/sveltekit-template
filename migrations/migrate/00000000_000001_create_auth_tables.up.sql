CREATE TABLE IF NOT EXISTS auth.user (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) NOT NULL UNIQUE,
	name VARCHAR(255),
	phone_number VARCHAR(20),
	username TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS auth.session (
	id TEXT PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
	expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS auth.phone_verifications (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
	phone_number VARCHAR(20) NOT NULL,
	code VARCHAR(10) NOT NULL,
	verification_type VARCHAR(20) NOT NULL DEFAULT 'otp',
	is_used BOOLEAN DEFAULT false NOT NULL,
	expires_at TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
