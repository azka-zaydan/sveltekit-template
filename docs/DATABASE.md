# Database Architecture

> **Note**: For AI agent guidance on database operations, see [`.github/instructions/database.md`](../.github/instructions/database.md)

## Multi-Schema PostgreSQL Design

This project uses a multi-schema PostgreSQL architecture to logically separate different types of data.

## Schema Organization

### 📁 Schema Structure

```
PostgreSQL Database: craigslist_dupe
├── auth schema       - Authentication & user management
│   ├── user
│   ├── session
│   └── phone_verifications
│
├── master schema     - Master/reference data
│   ├── categories
│   └── locations
│
├── app schema        - Application transactional data
│   ├── listings
│   ├── listing_images
│   └── favorites
│
└── public schema     - Migration tracking
    └── migration_history
```

## Schema Details

### `auth` Schema - Authentication Tables

**Purpose**: Isolate user authentication and session management

**Tables**:

- `auth.user` - User accounts with credentials
- `auth.session` - Active user sessions (Lucia auth)
- `auth.phone_verifications` - Phone verification codes/OTPs

**Benefits**:

- Security isolation
- Easy to apply auth-specific permissions
- Can be backed up separately
- Simplifies compliance requirements

### `master` Schema - Reference Data

**Purpose**: Store relatively static, shared reference data

**Tables**:

- `master.categories` - Listing categories (hierarchical)
- `master.locations` - Cities/regions

**Benefits**:

- Separate permissions (read-only for most users)
- Can be seeded independently
- Easy to version control master data
- Reduces coupling with application data

### `app` Schema - Application Data

**Purpose**: Main application transactional data

**Tables**:

- `app.listings` - User-generated listings
- `app.listing_images` - Listing photos
- `app.favorites` - User saved listings

**Benefits**:

- Clear separation from static data
- Easier to partition/shard if needed
- Application-specific permissions

### `public` Schema - System Tables

**Purpose**: Migration tracking and database utilities

**Tables**:

- `public.migration_history` - Tracks executed migrations

## Database Tables

### auth.user

User accounts with authentication credentials.

```sql
CREATE TABLE auth.user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone_number VARCHAR(20),
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### auth.session

Lucia authentication sessions.

```sql
CREATE TABLE auth.session (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);
```

### auth.phone_verifications

Phone number verification codes.

```sql
CREATE TABLE auth.phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  verification_type VARCHAR(20) NOT NULL,
  is_used BOOLEAN DEFAULT false NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### master.categories

Hierarchical listing categories.

```sql
CREATE TABLE master.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES master.categories(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### master.locations

Geographic locations for listings.

```sql
CREATE TABLE master.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) DEFAULT 'USA' NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### app.listings

Main classified ad listings.

```sql
CREATE TABLE app.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES master.categories(id),
  location_id UUID NOT NULL REFERENCES master.locations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2),
  is_price_negotiable BOOLEAN DEFAULT false,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_flagged BOOLEAN DEFAULT false NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP
);
```

### app.listing_images

Multiple images per listing.

```sql
CREATE TABLE app.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES app.listings(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### app.favorites

User-saved favorite listings.

```sql
CREATE TABLE app.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES app.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, listing_id)
);
```

## SQL Migration System

This project uses a custom SQL-based migration system with timestamped migration files.

### Directory Structure

```
migrations/
├── migrate/          # Schema migrations (DDL)
│   ├── 20251124_000000_create_schemas.up.sql
│   ├── 20251124_000000_create_schemas.down.sql
│   ├── 20251124_000001_create_migration_history.up.sql
│   └── ...
└── seed/            # Data seeds (DML)
    ├── 20251124_000001_default_categories.up.sql
    ├── 20251124_000001_default_categories.down.sql
    └── ...
```

### Commands

```bash
# Run migrations
npm run migrate:up          # Apply all pending migrations
npm run migrate:down        # Rollback all migrations

# Run seeds
npm run seed:up             # Apply all pending seeds
npm run seed:down           # Rollback all seeds

# Generate new migration
npm run generate:migration -- --type=migrate --name=add_new_column --schema=app
npm run generate:migration -- --type=seed --name=add_demo_data --schema=master
```

### File Naming Convention

All migration and seed files follow this format:

```
<timestamp>_<description>.<up|down>.sql
```

Examples:

- `20251124_120530_create_users_table.up.sql`
- `20251124_120530_create_users_table.down.sql`

### Migration Tracking

Migrations are tracked in `public.migration_history`:

```sql
CREATE TABLE public.migration_history (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Schema-Qualified Queries

All SQL files must use schema-qualified table names:

```sql
-- ✅ Correct
INSERT INTO master.categories (name, slug) VALUES ('Electronics', 'electronics');
SELECT * FROM auth.user WHERE email = 'user@example.com';

-- ❌ Incorrect
INSERT INTO categories (name, slug) VALUES ('Electronics', 'electronics');
SELECT * FROM user WHERE email = 'user@example.com';
```

### Cross-Schema Foreign Keys

Foreign keys across schemas are fully supported:

```sql
CREATE TABLE app.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES master.categories(id),
  location_id UUID NOT NULL REFERENCES master.locations(id),
  -- ...
);
```

## Drizzle ORM Schema

The Drizzle schema uses `pgSchema()` to define multi-schema support:

```typescript
import { pgSchema } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');
export const masterSchema = pgSchema('master');
export const appSchema = pgSchema('app');

export const user = authSchema.table('user', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: varchar('email', { length: 255 }).unique().notNull()
	// ...
});

export const categories = masterSchema.table('categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull()
	// ...
});

export const listings = appSchema.table('listings', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => categories.id)
	// ...
});
```

## Development Workflow

### Fresh Setup

```bash
# 1. Start database
docker compose up -d

# 2. Run migrations (creates all schemas and tables)
npm run migrate:up

# 3. Seed data (categories, locations, demo users, listings)
npm run seed:up

# 4. Browse database
npm run db:studio
```

### Schema Changes

```bash
# 1. Update src/lib/server/db/schema.ts

# 2. Generate migration SQL file
npm run generate:migration -- --type=migrate --name=add_new_column --schema=app

# 3. Edit the generated .up.sql and .down.sql files

# 4. Apply migration
npm run migrate:up
```

### Reset Database

```bash
# Rollback all
npm run seed:down
npm run migrate:down

# Or drop and recreate
docker compose down -v
docker compose up -d
npm run migrate:up
npm run seed:up
```

## Best Practices

1. **Always use schema-qualified names** in SQL files
2. **Create schemas first** - migration `000000_create_schemas` must run before all others
3. **Use CASCADE** on foreign keys for user-owned data
4. **Make migrations idempotent** - use `IF NOT EXISTS`, `IF EXISTS`, `ON CONFLICT DO NOTHING`
5. **Test rollbacks** - ensure `.down.sql` files properly reverse `.up.sql`
6. **Separate DDL from DML** - schema changes in `migrate/`, data changes in `seed/`

## Permissions (Production)

For production, consider these permission patterns:

```sql
-- Read-only access to master data
GRANT SELECT ON ALL TABLES IN SCHEMA master TO app_user;

-- Full access to app schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_user;

-- Restricted access to auth schema
GRANT SELECT, INSERT, UPDATE ON auth.user TO app_user;
GRANT SELECT, INSERT, DELETE ON auth.session TO app_user;
```
