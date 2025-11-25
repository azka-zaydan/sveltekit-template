# Template Usage Guide

This document explains how to use this SvelteKit template effectively for your projects.

## What This Template Provides

### 🏗️ Architecture

- **Multi-schema PostgreSQL** - Organized data separation (auth, app, master)
- **Type-safe everything** - Zod validation + TypeScript
- **Custom SQL migrations** - Full control over schema changes
- **Winston logging** - Production-ready request tracking

### 🔧 Tech Stack

- SvelteKit 2 + Svelte 5 (Runes API)
- Tailwind CSS 4 (Vite plugin)
- Drizzle ORM + PostgreSQL
- Lucia authentication
- Zod v4 validation

### 📁 Pre-configured Structure

- API client pattern
- Error handling system
- Logging middleware
- Migration system
- Comprehensive documentation

## Getting Started

### 1. Initial Setup

```bash
# Clone template
git clone <template-url> my-new-project
cd my-new-project

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Customize Project

**Update `package.json`:**

```json
{
	"name": "my-new-project",
	"version": "0.0.1"
}
```

**Update `compose.yaml`:**

```yaml
container_name: my-project-db
environment:
  POSTGRES_DB: my_database
  POSTGRES_PASSWORD: secure_password
```

**Update `.env`:**

```bash
DATABASE_URL="postgres://root:secure_password@localhost:5432/my_database"
```

### 3. Initialize Database

```bash
docker compose up -d
npm run migrate:up
npm run seed:up
```

### 4. Start Development

```bash
npm run dev
```

## Building Your Application

### Step 1: Define Database Schema

**Edit `src/lib/server/db/schema.ts`:**

```typescript
import { pgSchema } from 'drizzle-orm/pg-core';
import { uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');

export const posts = appSchema.table('posts', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content').notNull(),
	userId: uuid('user_id').references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
```

### Step 2: Create Migration

```bash
npm run generate:migration -- --type=migrate --name=create_posts_table --schema=app
```

**Edit generated migration file:**

```sql
-- migrations/migrate/TIMESTAMP_create_posts_table.up.sql
CREATE TABLE IF NOT EXISTS app.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.user(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Run migration:**

```bash
npm run migrate:up
```

### Step 3: Create Zod Schema

**Create `src/lib/types/posts.schemas.ts`:**

```typescript
import { z } from 'zod';
import { uuidSchema } from './common.schemas';

export const postSchema = z.object({
	id: uuidSchema,
	title: z.string().min(1).max(255),
	content: z.string().min(1),
	userId: uuidSchema,
	createdAt: z.coerce.date()
});

export const createPostSchema = postSchema.omit({
	id: true,
	userId: true,
	createdAt: true
});

export type Post = z.infer<typeof postSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
```

### Step 4: Create API Client

**Create `src/lib/api/posts.ts`:**

```typescript
import { createPostSchema } from '$lib/types/posts.schemas';
import { apiFetch } from './base';
import type { Post } from '$lib/types/posts.schemas';

export function createPostsApi(fetch: typeof globalThis.fetch) {
	return {
		async getAll(): Promise<Post[]> {
			return apiFetch<Post[]>(fetch, '/api/posts');
		},

		async create(data: unknown): Promise<Post> {
			const validated = createPostSchema.parse(data);
			return apiFetch<Post>(fetch, '/api/posts', {
				method: 'POST',
				body: JSON.stringify(validated)
			});
		}
	};
}
```

**Add to `src/lib/api/client.ts`:**

```typescript
import { createPostsApi } from './posts';

export function createApiClient(fetch: typeof globalThis.fetch) {
	return {
		auth: createAuthApi(fetch),
		posts: createPostsApi(fetch) // Add this
		// ... other APIs
	};
}
```

### Step 5: Create API Endpoint

**Create `src/routes/api/posts/+server.ts`:**

```typescript
import { withApiLogging } from '$lib/server/logger/middleware';
import { createPostSchema } from '$lib/types/posts.schemas';
import { ApiError, ApiSuccess } from '$lib/server/errors';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';

export async function GET(event) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const allPosts = await db.select().from(posts);
			return ApiSuccess.ok(allPosts, { requestId });
		},
		{ operation: 'LIST_POSTS', schema: 'app' }
	);
}

export async function POST(event) {
	return withApiLogging(
		event,
		async ({ requestId, userId }) => {
			if (!userId) {
				return ApiError.unauthorized('Authentication required', requestId);
			}

			const body = await event.request.json();
			const result = createPostSchema.safeParse(body);

			if (!result.success) {
				return ApiError.fromZod(result.error, requestId);
			}

			const [post] = await db
				.insert(posts)
				.values({
					...result.data,
					userId
				})
				.returning();

			return ApiSuccess.created(post, { requestId });
		},
		{ operation: 'CREATE_POST', schema: 'app' }
	);
}
```

### Step 6: Use in Pages

**Create `src/routes/posts/+page.server.ts`:**

```typescript
import { createApiClient } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const api = createApiClient(fetch);
	const posts = await api.posts.getAll();
	return { posts };
};
```

**Create `src/routes/posts/+page.svelte`:**

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<h1>Posts</h1>

{#each data.posts as post (post.id)}
	<article>
		<h2>{post.title}</h2>
		<p>{post.content}</p>
	</article>
{/each}
```

## Core Patterns to Follow

### Always Use Schema-First Validation

1. Define Zod schema
2. Infer TypeScript types
3. Validate on both client and server

### Always Use API Client Pattern

Never use raw `fetch()` - always use the typed API client.

### Always Use Schema-Qualified SQL

```sql
-- ✅ Correct
INSERT INTO app.posts (...) VALUES (...);

-- ❌ Wrong
INSERT INTO posts (...) VALUES (...);
```

### Always Use Logging Wrappers

```typescript
// API endpoints
return withApiLogging(
	event,
	async ({ requestId }) => {
		// your logic
	},
	{ operation: 'YOUR_OP', schema: 'app' }
);

// Database queries
const data = await withQueryLogging('query_name', () => db.select().from(table), {
	requestId,
	schema: 'app'
});
```

## Key Commands

```bash
# Development
npm run dev                  # Start dev server
npm run check                # Type check
npm run lint                 # Lint code
npm run format               # Format code

# Database
docker compose up -d         # Start PostgreSQL
npm run migrate:up           # Run migrations
npm run seed:up              # Run seeds
npm run db:studio            # Database GUI

# Migrations
npm run generate:migration -- --type=migrate --name=your_migration --schema=app
npm run generate:migration -- --type=seed --name=your_seed --schema=master

# Production
npm run build                # Build for production
npm run start                # Start production server
```

## Documentation Structure

### For AI Agents (`.github/instructions/`)

- `validation.instructions.md` - How to use Zod validation
- `api-client.instructions.md` - API client patterns
- `database.instructions.md` - Multi-schema database
- `svelte5.instructions.md` - Svelte 5 runes
- `workflows.instructions.md` - Development workflows
- `logging.instructions.md` - Logging system

### For Developers (`/docs`)

- `API.md` - API examples and patterns
- `DATABASE.md` - Database architecture
- `DEVELOPMENT.md` - Development guide
- `ERROR_HANDLING.md` - Error handling
- `LOGGER.md` - Logging details
- `COMPONENTS.md` - UI components

## Common Customizations

### Change UI Design

Edit `.github/instructions/ui-design.instructions.md` and `docs/UI_STYLE_GUIDE.md`

### Add New Database Schema

1. Add to `src/lib/server/db/schema.ts`
2. Create migration
3. Export from schema file

### Add Authentication Provider

Edit `src/lib/server/auth.ts` and follow Lucia docs

### Change Deployment Target

Update `svelte.config.js` adapter and follow deployment docs

## Best Practices

1. **Always validate input** - Client + Server
2. **Use typed API client** - Never raw fetch
3. **Log all operations** - Use logging wrappers
4. **Test migrations** - Up and down
5. **Keep docs updated** - Especially API.md
6. **Use Svelte 5 runes** - No old syntax
7. **Schema-qualify SQL** - Always use schema prefix

## Troubleshooting

### Database Issues

```bash
# Reset database
docker compose down -v
docker compose up -d
npm run migrate:up
```

### Type Errors

```bash
# Full type check
npm run check

# Watch mode
npm run check:watch
```

### Migration Issues

```bash
# Check migration history
docker exec -it sveltekit-template-db psql -U root -d your_database
SELECT * FROM migration_history;
```

## Next Steps

1. **Customize for your domain** - Update schemas, types, APIs
2. **Add your business logic** - Follow the patterns
3. **Build your UI** - Use Svelte 5 components
4. **Deploy** - See deployment guides
5. **Maintain** - Keep dependencies updated

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Zod](https://zod.dev/)
- [Lucia Auth](https://lucia-auth.com/)

## Support

Refer to:

- Project documentation in `/docs`
- AI instructions in `.github/instructions`
- Example patterns in this template
