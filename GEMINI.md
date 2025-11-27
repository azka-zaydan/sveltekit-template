# AI Agent Guide - SvelteKit Template

> **Critical**: This is the master template for SvelteKit projects. Read ALL instructions before making code changes.

## 🚨 MANDATORY PRE-FLIGHT CHECKLIST

**Before making ANY code changes, you MUST:**

1. **Read copilot-instructions.md**: `.github/copilot-instructions.md` - Main project rules and standards
2. **Consult Svelte MCP**: Use `list-sections` → `get-documentation` → `svelte-autofixer` workflow
3. **Check relevant instructions**: Read applicable files from `.github/instructions/` based on your task
4. **Verify documentation**: Check `/docs` for existing patterns and API references
5. **Follow DRY principle**: Extract reusable functions, never duplicate code
6. **Follow UI design guidelines**: Refer to `ui-design.instructions.md` for the project's specific design language.

## 📚 Project Documentation Structure

### Core Instructions (`.github/instructions/`)

**ALWAYS read these BEFORE coding:**

- **`api-client.instructions.md`** - Type-safe API client pattern (MANDATORY for API calls)
- **`database.instructions.md`** - Multi-schema PostgreSQL architecture (CRITICAL for DB changes)
- **`logging.instructions.md`** - Winston logging system (REQUIRED for all API/DB operations)
- **`svelte5.instructions.md`** - Svelte 5 runes patterns (NO Svelte 4 syntax allowed)
- **`validation.instructions.md`** - Zod v4 schema-first validation (MANDATORY for all inputs)
- **`ui-design.instructions.md`** - UI design principles (CRITICAL for all UI work)
- **`workflows.instructions.md`** - Development workflows and quality checks

### Developer Documentation (`/docs`)

**Reference these for detailed information:**

- **`API.md`** - Complete API endpoint reference
- **`COMPONENTS.md`** - Reusable component library
- **`DATABASE.md`** - Database schema and migration system
- **`DEVELOPMENT.md`** - Development guide and patterns
- **`ERROR_HANDLING.md`** - Standardized error responses
- **`LOGGER.md`** - Winston logger usage and best practices
- **`UI_STYLE_GUIDE.md`** - Complete design system (MUST READ for UI)

## 🎯 Project-Specific Rules

### UI Design

**Refer to `ui-design.instructions.md` for the specific design language of this project.** The template assumes a clean, functional base, but specific projects may enforce strict themes (e.g., Retro, Modern).

### Database Architecture

1. **Multi-Schema**: Uses `auth`, `master`, and `app` PostgreSQL schemas
2. **Schema Qualification**: ALWAYS use schema-qualified names (e.g., `auth.user`) in SQL
3. **Cross-Schema FKs**: Supported
4. **Custom Migrations**: SQL-based migrations (NOT Drizzle Kit)

### Critical Patterns

**API Client Usage** (MANDATORY):

```typescript
// ✅ CORRECT - Use type-safe API client
import { createApiClient } from '$api/client';

const api = createApiClient(fetch);
const items = await api.items.getAll();

// ❌ WRONG - Never use raw fetch
const response = await fetch('/api/items');
const data = await response.json();
```

**Validation Pattern** (MANDATORY):

```typescript
// ✅ CORRECT - Schema-first with Zod v4
import { createItemSchema } from '$types/app.schemas';
import { ApiError } from '$server/errors';

const result = createItemSchema.safeParse(data);
if (!result.success) {
	return ApiError.fromZod(result.error, requestId);
}
const validated = result.data; // Fully typed!
```

**Logging Pattern** (MANDATORY):

```typescript
// ✅ CORRECT - Use wrappers with context
import { withApiLogging } from '$server/logger/middleware';
import { withQueryLogging } from '$server/logger/db';

export async function POST(event) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const items = await withQueryLogging('get_items', () => db.select().from(items), {
				requestId,
				schema: 'app'
			});
			return { items };
		},
		{ operation: 'GET_ITEMS', schema: 'app' }
	);
}
```

**Svelte 5 Pattern** (MANDATORY):

```svelte
<script lang="ts">
	// ✅ CORRECT - Svelte 5 runes
	let { data, children } = $props();
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<!-- ✅ CORRECT - Lowercase event handlers -->
<button onclick={increment}>Click</button>
```

## 🔧 Available MCP Tools

### Svelte MCP Server

**ALWAYS use this workflow for Svelte development:**

1. **`list-sections`**: Discover all available documentation sections.
2. **`get-documentation`**: Retrieve full documentation content.
3. **`svelte-autofixer`**: Validate Svelte 5 compliance and best practices.
4. **`playground-link`**: Generate Svelte Playground link (only if requested).

### Context7 MCP Server (Upstash)

**For library documentation:**

1. **`resolve-library-id`**: Get Context7-compatible library ID.
2. **`get-library-docs`**: Fetch up-to-date library documentation.

## 🛠️ Development Workflow

### Before Writing Code

1. **Read Instructions**: Main (`.github/copilot-instructions.md`), Specific (`.github/instructions/*.md`), Docs (`/docs`).
2. **Consult MCP Servers**: Svelte MCP, Context7 MCP.
3. **Verify Patterns**: API Client, Validation, Components.

### During Development

1. **Create Schemas First** (Validation): Define Zod schemas in `src/lib/types/*.schemas.ts`.
2. **Use API Client Pattern**: Add methods to `src/lib/api/`.
3. **Add Logging** (MANDATORY): Wrap API endpoints and DB queries.
4. **Follow UI Design**: Use existing components and follow style guide.
5. **Follow Svelte 5 Patterns**: Use runes and lowercase event handlers.

### After Writing Code

**MANDATORY VALIDATION SEQUENCE:**

1. **Svelte Autofixer** (if Svelte component)
2. **Format Code**: `npm run format`
3. **Lint Code**: `npm run lint`
4. **Type Check**: `npm run check`

## 📋 Common Tasks Reference

### Adding New Feature

1. **Read**: Instructions.
2. **Create Schema**: `src/lib/types/app.schemas.ts`.
3. **Create Endpoint**: `src/routes/api/[feature]/*/+server.ts`.
4. **Create Client Method**: `src/lib/api/[feature].ts`.
5. **Create UI Component**: `src/lib/components/ui/[feature]/`.
6. **Validate**: Fix, Format, Lint, Check.

### Database Schema Change

1. **Read**: `database.instructions.md`.
2. **Update Drizzle Schema**: `src/lib/server/db/schema/*.schema.ts`.
3. **Update Zod Schema**: `src/lib/types/*.schemas.ts`.
4. **Generate Migration**: `npm run generate:migration`.
5. **Edit SQL Files**: Review `.up.sql` and `.down.sql`.
6. **Test Migration**: `npm run migrate:down` && `npm run migrate:up`.
7. **Validate**: `npm run check`.

## 🚫 Anti-Patterns (NEVER DO)

- ❌ **Raw fetch calls**: Use `createApiClient`.
- ❌ **Missing logging**: Wrap operations.
- ❌ **Manual validation**: Use Zod schemas.
- ❌ **Svelte 4 syntax**: Use Svelte 5 runes.
- ❌ **Type duplication**: Infer from schemas.
- ❌ **Unqualified schema names**: Use `schema.table`.

## ✅ Success Criteria

1. ✅ Instructions followed.
2. ✅ MCP servers consulted.
3. ✅ Svelte autofixer passed.
4. ✅ Format, Lint, Check passed.
5. ✅ Patterns followed (API, Validation, Logging).
6. ✅ UI Design followed.
7. ✅ DRY principle applied.
8. ✅ Documentation updated.

## 🎯 Remember

- **Read first, code second**.
- **Use MCP servers**.
- **Follow patterns**.
- **Validate everything**.
- **Log comprehensively**.
- **Stay DRY**.
- **Type safety**.
- **Svelte 5 only**.

**When in doubt, ask the user or read more documentation.**
