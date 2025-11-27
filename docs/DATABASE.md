# Database Architecture

> **Note**: For AI agent guidance on database operations, see [`.github/instructions/database.md`](../.github/instructions/database.md)

## Multi-Schema PostgreSQL Design

This project uses a multi-schema PostgreSQL architecture to logically separate different types of data.

## Schema Organization

### 📁 Schema Structure

```
PostgreSQL Database: project_db
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
│   └── items
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

- `master.categories` - Hierarchical categories
- `master.locations` - Cities/regions

**Benefits**:

- Separate permissions (read-only for most users)
- Can be seeded independently
- Easy to version control master data
- Reduces coupling with application data

### `app` Schema - Application Data

**Purpose**: Main application transactional data

**Tables**:

- `app.items` - Core business entities

**Benefits**:

- Clear separation from static data
- Easier to partition/shard if needed
- Application-specific permissions

### `public` Schema - System Tables

**Purpose**: Migration tracking and database utilities

**Tables**:

- `public.migration_history` - Tracks executed migrations

## SQL Migration System

This project uses a custom SQL-based migration system with timestamped migration files.

### Directory Structure

```
migrations/
├── migrate/          # Schema migrations (DDL)
│   ├── 20251124_000000_create_schemas.up.sql
│   ├── 20251124_000000_create_schemas.down.sql
│   └── ...
└── seed/            # Data seeds (DML)
    ├── 20251124_000001_default_data.up.sql
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

### Schema-Qualified Queries

All SQL files must use schema-qualified table names:

```sql
-- ✅ Correct
INSERT INTO master.categories (name) VALUES ('Electronics');
SELECT * FROM auth.user WHERE email = 'user@example.com';

-- ❌ Incorrect
INSERT INTO categories (name) VALUES ('Electronics');
SELECT * FROM user WHERE email = 'user@example.com';
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

export const items = appSchema.table('items', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
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

# 3. Seed data
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