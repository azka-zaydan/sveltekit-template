# SvelteKit Production Template

A production-ready SvelteKit 2 template with TypeScript, Drizzle ORM, PostgreSQL, Lucia authentication, comprehensive validation, and type-safe API patterns.

## Features

- ✅ **SvelteKit 2 + Svelte 5** - Modern full-stack framework with runes API
- ✅ **TypeScript Strict Mode** - Full type safety
- ✅ **PostgreSQL + Drizzle ORM** - Type-safe database with multi-schema architecture
- ✅ **Lucia Authentication** - Session-based auth with secure password hashing
- ✅ **Zod v4 Validation** - Runtime type-safe validation at all boundaries
- ✅ **Type-Safe API Client** - Factory pattern for SSR compatibility
- ✅ **Winston Logging** - Production-ready logging with daily rotation and structured metadata
- ✅ **Tailwind CSS 4** - Utility-first styling with Vite plugin
- ✅ **Component Library** - Reusable Svelte 5 components
- ✅ **Path Aliases** - Clean imports with $api, $types, $components, etc.
- ✅ **Railway Ready** - One-click deployment configuration

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (for PostgreSQL)
- Git

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd sveltekit-template

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Run database migrations
npm run migrate:up

# (Optional) Seed demo data
npm run seed:up

# Start dev server
npm run dev
```

Visit http://localhost:5173

## Project Structure

```
src/
├── lib/
│   ├── api/              # Type-safe API client ($api)
│   │   ├── base.ts       # apiFetch, buildQueryString
│   │   ├── auth.ts       # Authentication methods
│   │   ├── client.ts     # createApiClient factory
│   │   └── index.ts      # Public exports
│   ├── components/       # Reusable Svelte components ($components, $ui)
│   │   ├── ui/
│   │   │   ├── common/   # Base components (forms, display, actions)
│   │   │   └── layout/   # Layout components (Container, Navigation, etc.)
│   │   └── index.ts      # Component exports
│   ├── server/           # SERVER-ONLY code ($server, $db, $schema)
│   │   ├── auth.ts       # Lucia setup
│   │   ├── errors.ts     # ApiError utilities
│   │   ├── responses.ts  # ApiSuccess utilities
│   │   ├── logger/       # Winston logging library
│   │   │   ├── index.ts  # Logger instance + helpers
│   │   │   ├── config.ts # Transport configuration
│   │   │   └── formatters.ts # Custom formatters
│   │   └── db/           # Database ($db)
│   │       ├── index.ts  # DB client
│   │       └── schema.ts # Drizzle schemas ($schema)
│   ├── types/            # Zod schemas & inferred types ($types)
│   │   ├── common.schemas.ts    # Primitives (UUID, email, etc.)
│   │   ├── auth.schemas.ts      # User, Session schemas
│   │   └── master.schemas.ts    # Categories, Locations
│   └── utils/            # Shared utilities ($utils)
│       ├── format.ts     # formatPrice, formatDate, etc.
│       ├── image.ts      # Image validation/preview
│       └── index.ts      # Utility exports
├── routes/
│   ├── api/              # JSON API endpoints
│   └── demo/             # Demo pages
└── hooks.server.ts       # Session validation

migrations/
├── migrate/              # Database schema migrations
└── seed/                 # Demo data seeds

docs/                     # Complete documentation
scripts/                  # Migration and deployment scripts
```

## Path Aliases

```typescript
import { createApiClient } from '$api/client'; // API client
import type { User } from '$types/auth.schemas'; // Type schemas
import { Button, Input } from '$components'; // Components
import Navigation from '$ui/layout/Navigation.svelte'; // Direct component
import { formatPrice } from '$utils'; // Utilities
import { db } from '$db'; // Database (server-only)
import { user, session } from '$schema'; // Schemas (server-only)
```

## Core Patterns

### Schema-First Validation

```typescript
// 1. Create Zod schema
export const createUserSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	password: passwordSchema
});

export type CreateUser = z.infer<typeof createUserSchema>;

// 2. Validate client-side
const result = createUserSchema.safeParse(formData);
if (!result.success) {
	// Show errors
}

// 3. Validate backend
export async function POST(event) {
	return withApiLogging(event, async ({ requestId }) => {
		const body = await event.request.json();
		const result = createUserSchema.safeParse(body);

		if (!result.success) {
			return ApiError.fromZod(result.error, requestId);
		}

		// Use validated data
		const validatedData = result.data;
		// ...
	});
}
```

### Type-Safe API Client

```typescript
// In +page.server.ts
import { createApiClient } from '$api/client';

export const load: PageServerLoad = async ({ fetch }) => {
	const api = createApiClient(fetch);

	// Type-safe API calls
	const user = await api.auth.me();

	return { user };
};
```

### Svelte 5 Components

```svelte
<script lang="ts">
	let { data } = $props(); // Props
	let count = $state(0); // Reactive state
	let doubled = $derived(count * 2); // Computed value

	$effect(() => {
		// Side effects
		console.log('Count:', count);
	});
</script>

<button onclick={() => count++}>
	Count: {count}
</button>
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run check            # Type check
npm run check:watch      # Type check (watch mode)
npm run lint             # Lint code
npm run format           # Format code

# Database
npm run db:studio        # Open Drizzle Studio
npm run migrate:up       # Run migrations
npm run migrate:down     # Rollback migrations
npm run seed:up          # Run seeds
npm run seed:down        # Rollback seeds
npm run generate:migration -- --type=migrate --name=add_column --schema=app

# Production
npm run build            # Build for production
npm run preview          # Preview production build
```

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Create Railway project from GitHub repo
3. Add PostgreSQL database
4. Set environment variables (see RAILWAY.md)
5. Run migrations: `railway run npm run railway:migrate`

See [RAILWAY.md](./RAILWAY.md) for detailed deployment guide.

### Environment Variables

Required in `.env`:

```bash
DATABASE_URL="postgresql://..."
NODE_ENV="development"  # or "production"
LOG_LEVEL="debug"       # debug | info | warn | error
LOG_TO_FILE="false"     # Enable file logging
```

## Documentation

- [Getting Started](./GETTING_STARTED.md) - Setup and first steps
- [Development Guide](./docs/DEVELOPMENT.md) - Development patterns
- [Database Guide](./docs/DATABASE.md) - Database architecture
- [API Reference](./docs/API.md) - API endpoints
- [Error Handling](./docs/ERROR_HANDLING.md) - Error handling patterns
- [Winston Logger](./docs/WINSTON_LOGGER.md) - Production logging system ⭐
- [Logger Demo](./docs/LOGGER_DEMO.md) - Interactive error handling examples
- [Components](./docs/COMPONENTS.md) - Component library
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment

## Tech Stack

- **Framework**: SvelteKit 2.48.5 + Svelte 5.18.3
- **Language**: TypeScript 5.7.3 (strict mode)
- **Database**: PostgreSQL + Drizzle ORM 0.44.7
- **Auth**: Lucia 4.2.4 + bcryptjs 3.0.3
- **Validation**: Zod 4.1.13
- **Styling**: Tailwind CSS 4.1.17
- **Logging**: Winston 3.18.3 + winston-daily-rotate-file 5.0.0
- **Deployment**: Node.js Adapter 5.4.0

## Architecture Highlights

### Multi-Schema Database

Organized into logical schemas:

- `auth` - User authentication
- `master` - Reference data
- `app` - Application data
- `public` - Migration tracking

### Type-Safe API

Factory pattern ensures SSR compatibility:

```typescript
const api = createApiClient(fetch); // Uses load function fetch
const data = await api.auth.me(); // Fully typed
```

### Validation Everywhere

Zod schemas at all boundaries:

- Client-side form validation
- Backend request validation
- Type inference for TypeScript
- Automatic error messages

### Component Library

Svelte 5 components with runes:

- Button (4 variants)
- Input, Select, Textarea (with validation)
- Card, Badge (display components)
- Container, Navigation, PageHeader (layout)

## License

MIT
