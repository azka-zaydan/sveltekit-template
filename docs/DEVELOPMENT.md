# Development Guide

> **Note**: For AI agent guidance on development workflows, see [`.github/instructions/workflows.md`](../.github/instructions/workflows.md)

## Project Structure

```
project/
├── src/
│   ├── lib/
│   │   ├── api/               # API client functions
│   │   ├── components/        # Reusable Svelte components
│   │   │   ├── ui/
│   │   │   │   ├── common/    # Base/reusable components
│   │   │   │   │   ├── actions/   # Button
│   │   │   │   │   ├── display/   # Badge, Card
│   │   │   │   │   └── forms/     # Input, Select, Textarea, FormError
│   │   │   │   └── layout/    # Layout components
│   │   │   └── index.ts       # Component exports
│   │   ├── server/            # Server-only code
│   │   │   ├── auth.ts        # Lucia authentication
│   │   │   ├── errors.ts      # Error handling
│   │   │   ├── logger/        # Winston logging
│   │   │   ├── rate-limit.ts  # Rate limiting utilities
│   │   │   └── db/            # Database layer
│   │   │       ├── index.ts   # Database client
│   │   │       └── schema/    # Drizzle schema definitions
│   │   ├── types/             # Zod schemas & inferred types
│   │   └── utils/             # Shared utilities
│   ├── routes/
│   │   ├── api/               # API endpoints
│   │   ├── +layout.server.ts  # Root layout server load
│   │   ├── +layout.svelte     # Root layout
│   │   ├── +page.server.ts    # Homepage server load
│   │   └── +page.svelte       # Homepage
│   ├── app.css                # Global Tailwind styles
│   ├── app.d.ts               # TypeScript declarations
│   ├── app.html               # HTML template
│   └── hooks.server.ts        # SvelteKit server hooks
├── scripts/
│   ├── generate-migration.ts  # Migration generator
│   ├── migrate.ts             # Migration runner
│   └── seed.ts                # Seed runner
├── migrations/
│   ├── migrate/               # Schema migrations
│   └── seed/                  # Data seeds
├── static/                    # Static assets
├── docs/                      # Documentation
├── compose.yaml               # Docker Compose config
├── drizzle.config.ts          # Drizzle ORM config
├── svelte.config.js           # SvelteKit config
├── tailwind.config.js         # Tailwind config
├── tsconfig.json              # TypeScript config
└── vite.config.ts             # Vite config
```

## Component Organization

### Common UI Components (`src/lib/components/ui/common/`)

Base/reusable components organized by purpose:

**Actions**:

- **Button.svelte** - Primary, secondary, danger, and link button variants

**Display**:

- **Badge.svelte** - Status badges and labels
- **Card.svelte** - Container component with optional border

**Forms**:

- **Input.svelte** - Text input with label and error support
- **Select.svelte** - Dropdown with options support
- **Textarea.svelte** - Multiline text input with character counter
- **FormError.svelte** - Consistent error message display

**Layout** (`src/lib/components/ui/layout/`):

- **Container.svelte** - Max-width container with responsive padding
- **Navigation.svelte** - Main navigation bar with auth state
- **PageHeader.svelte** - Page headers with breadcrumbs

## Path Aliases

The project uses SvelteKit path aliases for cleaner imports:

```typescript
// Components
import { Button, Input } from '$components'; // From index.ts
import Button from '$ui/common/actions/Button.svelte'; // Direct import
import Navigation from '$ui/layout/Navigation.svelte';

// API Client
import { createApiClient } from '$api/client';

// Types & Schemas
import type { Item } from '$types/app.schemas';
import { itemSchema } from '$types/app.schemas';

// Server-only
import { db } from '$db';
import { items, user } from '$schema';
import { ApiError } from '$server/errors';
import { log } from '$server/logger';

// Utils
import { formatDate } from '$utils/format';
```

**Available aliases** (configured in `svelte.config.js`):

- `$components` → `src/lib/components`
- `$ui` → `src/lib/components/ui`
- `$ui/layout` → `src/lib/components/ui/layout`
- `$api` → `src/lib/api`
- `$types` → `src/lib/types`
- `$server` → `src/lib/server`
- `$db` → `src/lib/server/db`
- `$schema` → `src/lib/server/db/schema`
- `$utils` → `src/lib/utils`

All aliases support wildcard variants (e.g., `$api/*`).

## Svelte 5 Patterns

This project uses Svelte 5's modern Runes API. Key patterns:

### Props

Use `$props()` instead of `export let`:

```svelte
<script lang="ts">
	// ✅ Svelte 5
	let { data, children } = $props();

	// ❌ Old way (Svelte 4)
	// export let data;
</script>
```

### State

Use `$state()` for reactive variables:

```svelte
<script lang="ts">
	// ✅ Svelte 5
	let count = $state(0);
	let items = $state<Item[]>([]);

	// ❌ Old way (Svelte 4)
	// let count = 0;
	// let items: Item[] = [];
</script>
```

### Derived Values

Use `$derived()` instead of `$:` for computed values:

```svelte
<script lang="ts">
	let count = $state(0);

	// ✅ Svelte 5
	let doubled = $derived(count * 2);

	// ❌ Old way (Svelte 4)
	// $: doubled = count * 2;
</script>
```

### Effects

Use `$effect()` instead of `$:` for side effects:

```svelte
<script lang="ts">
	let count = $state(0);

	// ✅ Svelte 5
	$effect(() => {
		console.log('Count changed:', count);
	});

	// ❌ Old way (Svelte 4)
	// $: console.log('Count changed:', count);
</script>
```

### Children/Slots

Use `{@render children()}` instead of `<slot>`:

```svelte
<script lang="ts">
	let { children } = $props();
</script>

<div class="wrapper">
	{@render children()}
</div>

<!-- ❌ Old way (Svelte 4) -->
<!-- <slot /> -->
```

## SvelteKit Patterns

### Page Load Functions

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// Server-side data fetching
	const res = await fetch('/api/items');
	const data = await res.json();

	return {
		items: data.items,
		user: locals.user // From hooks.server.ts
	};
};
```

### Form Actions

```typescript
// +page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// Validate and process
		if (!username || !password) {
			return fail(400, { message: 'Missing credentials' });
		}

		// ... authentication logic

		return { success: true };
	}
};
```

### API Routes

```typescript
// src/routes/api/items/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const limit = parseInt(url.searchParams.get('limit') ?? '20');
	const offset = parseInt(url.searchParams.get('offset') ?? '0');

	const items = await db.select().from(items).limit(limit).offset(offset);

	return json({ items });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await request.json();
	// ... create item

	return json({ success: true }, { status: 201 });
};
```

## Drizzle ORM Patterns

### Querying

```typescript
import { db } from '$db';
import { items, user } from '$schema';
import { eq, and } from 'drizzle-orm';

// Simple select
const allItems = await db.select().from(items);

// With conditions
const activeItems = await db.select().from(items).where(eq(items.isActive, true));

// With joins (cross-schema)
const itemsWithUser = await db.select().from(items).leftJoin(user, eq(items.userId, user.id));
```

### Inserting

```typescript
// Insert single record
await db.insert(items).values({
	userId: user.id,
	name: 'New Item',
	description: 'Description here'
});

// Insert with returning
const [newItem] = await db
	.insert(items)
	.values({
		/* ... */
	})
	.returning();
```

### Updating

```typescript
await db
	.update(items)
	.set({
		name: 'Updated Name',
		updatedAt: new Date()
	})
	.where(eq(items.id, itemId));
```

### Deleting

```typescript
await db.delete(items).where(eq(items.id, itemId));
```

## Authentication Flow

### Lucia Integration

```typescript
// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './db';
import { user, session } from './db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			username: attributes.username,
			name: attributes.name
		};
	}
});
```

### Server Hooks

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
```

## Styling with Tailwind

### Tailwind 4 Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: []
} satisfies Config;
```

### Using @tailwindcss/vite

The project uses Tailwind 4's Vite plugin (not PostCSS):

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

### Common Patterns

```svelte
<!-- Container with max width -->
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
	<!-- Content -->
</div>

<!-- Card -->
<div class="rounded-lg bg-white p-6 shadow">
	<!-- Content -->
</div>

<!-- Button -->
<button class="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"> Click me </button>

<!-- Grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	<!-- Items -->
</div>
```

## Development Commands

```bash
# Development server
npm run dev                    # Start dev server with HMR

# Type checking
npm run check                  # One-time type check
npm run check:watch            # Watch mode

# Linting & formatting
npm run lint                   # Run ESLint
npm run format                 # Format with Prettier

# Building
npm run build                  # Production build
npm run preview                # Preview production build

# Database
npm run db:studio              # Open Drizzle Studio
npm run migrate:up             # Run migrations
npm run seed:up                # Run seeds
npm run generate:migration     # Generate new migration
```

## Testing Workflow

### Manual Testing

1. Start database: `docker compose up -d`
2. Run migrations: `npm run migrate:up`
3. Run seeds: `npm run seed:up`
4. Start dev server: `npm run dev`
5. Test features at http://localhost:5173

### Database Inspection

```bash
# Open Drizzle Studio
npm run db:studio

# Or use Docker
docker exec -it project-db psql -U root -d project_db

# Check specific schema
\dt auth.*
\dt master.*
\dt app.*
```

## Common Issues

### Import Path Issues

Always use `$lib` alias for imports:

```typescript
// ✅ Correct
import { db } from '$lib/server/db';

// ❌ Wrong
import { db } from '../../../lib/server/db';
```

### Server vs Client Code

Code in `src/lib/server/` is automatically excluded from client bundles:

```typescript
// ✅ Safe - in src/lib/server/
export const db = drizzle(client);

// ❌ Never import server code in client
import { db } from '$lib/server/db'; // Error if in .svelte file
```

### Type Safety

Let TypeScript and Drizzle infer types:

```typescript
// ✅ Inferred types
const item = await db.select().from(items).where(eq(items.id, id));

// ❌ Manual types (unnecessary)
const item: Item = await db.select().from(items).where(eq(items.id, id));
```

## Best Practices

1. **Use Svelte 5 runes** - no more `export let` or `$:` reactive statements
2. **Server-side validation** - never trust client input
3. **Schema-qualified queries** - always use `auth.user`, `app.items`, etc.
4. **Type-safe routes** - use generated `$types` from SvelteKit
5. **Consistent naming** - camelCase for JS/TS, kebab-case for routes/files
6. **Component composition** - keep components small and focused
7. **Error handling** - use SvelteKit's `fail()` for form validation errors
8. **Progressive enhancement** - forms should work without JavaScript