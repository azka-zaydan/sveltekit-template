# Copilot Instructions

> **Note**: This is the main instruction file. Detailed guides are in `.github/instructions/`.

## Project Overview

SvelteKit 2 template with Svelte 5, Drizzle ORM, and PostgreSQL with **multi-schema architecture**. Features Lucia authentication, custom SQL migration system, Winston logging, type-safe API client, and schema-first validation.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes API) + TypeScript strict mode
- **Styling**: Tailwind CSS 4 via Vite plugin (`@tailwindcss/vite`)
- **Database**: PostgreSQL + Drizzle ORM with postgres-js driver
- **Auth**: Lucia + Argon2 password hashing
- **Validation**: Zod v4 for runtime type-safe validation (schema-first approach)
- **Logging**: Winston with custom formatters and request tracking
- **Deployment**: Node.js adapter (`@sveltejs/adapter-node`)

## MANDATORY RULES

### Before Code Changes

1. **ALWAYS consult MCP servers first**:
   - Svelte MCP: `list-sections` → `get-documentation` → `svelte-autofixer`
   - Context7 MCP: `resolve-library-id` → `get-library-docs` for library APIs
2. **Check existing documentation** in `/docs` and `.github/instructions/`
3. **Verify schema qualification** for all SQL operations (use appropriate schema names)

### During Code Changes

4. **Use Svelte 5 runes exclusively** - See [svelte5.instructions.md](instructions/svelte5.instructions.md)
5. **Use Zod v4 validation** - See [validation.instructions.md](instructions/validation.instructions.md)
6. **Use API client pattern** - See [api-client.instructions.md](instructions/api-client.instructions.md)
7. **Wrap API endpoints with logging** - See [logging.instructions.md](instructions/logging.instructions.md)
8. **Wrap database queries with logging** - See [database.instructions.md](instructions/database.instructions.md)

### After Code Changes

9. **ALWAYS run validation**:
   ```bash
   npm run format    # Auto-format code
   npm run lint      # Check linting
   npm run check     # TypeScript + Svelte validation
   ```
10. **Update documentation** for new features
11. **Test migrations** if database schema changed - See [database.instructions.md](instructions/database.instructions.md)

## Core Patterns (Quick Reference)

### Schema-First Validation

```typescript
// 1. Create Zod schema in src/lib/types/*.schemas.ts
export const entitySchema = z.object({ ... });
export type Entity = z.infer<typeof entitySchema>;

// 2. Validate client-side before API call
const result = createEntitySchema.safeParse(formData);

// 3. Validate backend in API endpoint
const result = createEntitySchema.safeParse(body);
if (!result.success) {
  return ApiError.fromZod(result.error, requestId);
}
```

See [validation.instructions.md](instructions/validation.instructions.md) for complete guide.

### Type-Safe API Client

```typescript
// Always use createApiClient(fetch)
import { createApiClient } from '$lib/api/client';

export const load: PageServerLoad = async ({ fetch }) => {
	const api = createApiClient(fetch);
	const data = await api.entities.getAll({ limit: 10 });
	return { data };
};
```

See [api-client.instructions.md](instructions/api-client.instructions.md) for adding new endpoints.

### Multi-Schema Database

```typescript
// Use schema-qualified names
export const user = authSchema.table('user', { ... });
export const entities = appSchema.table('entities', {
  userId: uuid('user_id').references(() => user.id)  // Cross-schema FK
});
```

See [database.instructions.md](instructions/database.instructions.md) for schema update workflow.

### Svelte 5 Components

```svelte
<script lang="ts">
	let { data, children } = $props(); // ✅ Svelte 5
	let count = $state(0); // ✅ Reactive state
	let doubled = $derived(count * 2); // ✅ Computed

	// ❌ Never: export let, $:, <slot>
</script>
```

See [svelte5.instructions.md](instructions/svelte5.instructions.md) for all patterns.

## Project Structure

```
src/
├── lib/
│   ├── api/            # Type-safe API client
│   ├── components/     # Reusable Svelte components
│   ├── server/         # SERVER-ONLY (auth, db, errors, logger)
│   ├── types/          # Zod schemas & inferred types
│   └── utils/          # Shared utilities
├── routes/
│   ├── api/            # JSON API endpoints
│   └── +layout.svelte  # Root layout
└── hooks.server.ts     # Session validation

migrations/
├── migrate/            # Database schema migrations
└── seed/               # Demo data seeds

.github/
├── copilot-instructions.md  # This file
└── instructions/            # Detailed guides
    ├── validation.md        # Zod v4 validation
    ├── api-client.md        # API client usage
    ├── database.md          # Multi-schema DB
    ├── svelte5.md           # Svelte 5 patterns
    ├── workflows.md         # Development workflows
    └── logging.md           # Winston logging
```

## Quick Start

```bash
cp .env.example .env
docker compose up -d
npm run migrate:up
npm run seed:up
npm run dev  # → http://localhost:5173
```

See [workflows.instructions.md](instructions/workflows.instructions.md) for complete setup.

## Common Pitfalls

1. **Schema qualification**: SQL files MUST use schema-qualified table names
2. **Svelte 4 syntax**: No `export let`, `<slot>`, or `$:` reactive statements
3. **Raw fetch calls**: Use API client instead of `fetch('/api/...')`
4. **Type duplication**: Use `z.infer<>` instead of manual type definitions
5. **Missing validation**: Validate on both client and backend
6. **Client-side DB access**: Never import `$lib/server/*` in `.svelte` files

## Documentation

### AI Agent Instructions

- [validation.instructions.md](instructions/validation.instructions.md) - Zod v4 validation system
- [api-client.instructions.md](instructions/api-client.instructions.md) - Type-safe API client
- [database.instructions.md](instructions/database.instructions.md) - Multi-schema database
- [svelte5.instructions.md](instructions/svelte5.instructions.md) - Svelte 5 patterns
- [workflows.instructions.md](instructions/workflows.instructions.md) - Development workflows
- [logging.instructions.md](instructions/logging.instructions.md) - Winston logging

### Developer Documentation

- `/docs/API.md` - API endpoint reference
- `/docs/DATABASE.md` - Database architecture
- `/docs/DEVELOPMENT.md` - Development guide
- `/docs/ERROR_HANDLING.md` - Error handling patterns
- `/docs/LOGGER.md` - Logging system details

## Authentication

Session-based auth using Lucia with SHA-256 hashed tokens. Session validation happens in `src/hooks.server.ts` on every request.

**Key Files**:

- `src/lib/server/auth.ts` - Lucia setup
- `src/hooks.server.ts` - Session validation
- `src/routes/api/auth/*` - Auth endpoints

## Best Practices

1. **Type-safe API client** (`src/lib/api/`) with validation
2. **Zod v4 validation schemas** for all entities
3. **Standardized error handling** (`ApiError`, `ApiSuccess`)
4. **Use API client pattern** in all `+page.server.ts`
5. **Comprehensive logging** with Winston

### Migration from Raw Fetch

**Old**:

```typescript
const response = await fetch('/api/entities');
const data = await response.json();
```

**New**:

```typescript
const api = createApiClient(fetch);
const data = await api.entities.getAll();
```

See [api-client.instructions.md](instructions/api-client.instructions.md) for migration checklist.
