# Debugging Guide

> **Note**: For AI agent guidance on debugging workflows, see [`.github/instructions/workflows.instructions.md`](../.github/instructions/workflows.instructions.md)

Complete guide to debugging the YourApp Clone application during development and production.

## Table of Contents

1. [Logging](#logging)
2. [Breakpoint Debugging](#breakpoint-debugging)
3. [Common Issues](#common-issues)
4. [Database Debugging](#database-debugging)
5. [API Debugging](#api-debugging)
6. [Client-Side Debugging](#client-side-debugging)
7. [Performance Debugging](#performance-debugging)

---

## Logging

This project uses **Winston** for comprehensive logging. All logs include request IDs for tracing requests across the application.

### Log Levels

- `debug` - Verbose debugging info (development only)
- `info` - Business events (user created, listing posted)
- `warn` - Slow queries, 4xx responses
- `error` - Critical errors with stack traces
- `http` - HTTP request/response tracking (automatic)

### Viewing Logs

**Console logs (development)**:

```bash
npm run dev
```

Logs appear in the terminal with color-coding:

- 🔵 Blue: HTTP requests
- 🟢 Green: Info messages
- 🟡 Yellow: Warnings
- 🔴 Red: Errors

**File logs (when enabled)**:

```bash
# View all logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# View only errors
tail -f logs/error-$(date +%Y-%m-%d).log

# View HTTP requests
tail -f logs/http-$(date +%Y-%m-%d).log
```

### Enable File Logging

Update `.env`:

```env
LOG_TO_FILE=true
LOG_LEVEL=debug
```

### Adding Logging to Your Code

**API endpoints** (automatic logging):

```typescript
// src/routes/api/example/+server.ts
import { withApiLogging } from '$lib/server/logger/middleware';

export async function GET(event) {
	return withApiLogging(
		event,
		async ({ requestId, userId }) => {
			// Your logic here
			// Automatically logs request/response with timing
			return { data: 'example' };
		},
		{ operation: 'GET_EXAMPLE', schema: 'app' }
	);
}
```

**Database queries** (automatic slow query detection):

```typescript
import { withQueryLogging } from '$lib/server/logger/db';

const users = await withQueryLogging('get_all_users', () => db.select().from(users), {
	requestId: locals.requestId,
	schema: 'auth',
	warnThresholdMs: 500 // Warn if query takes > 500ms
});
```

**Manual logging**:

```typescript
import { log } from '$lib/server/logger';

// Info logging
log.info('User created account', {
	requestId,
	userId: user.id,
	operation: 'REGISTER',
	schema: 'auth'
});

// Error logging with stack trace
try {
	await riskyOperation();
} catch (error) {
	log.error('Operation failed', {
		requestId,
		operation: 'RISKY_OP',
		error: error instanceof Error ? error.message : 'Unknown error',
		stack: error instanceof Error ? error.stack : undefined
	});
	throw error;
}

// Warning logging
log.warn('Slow external API call', {
	requestId,
	operation: 'EXTERNAL_API',
	duration: 3500,
	threshold: 1000
});
```

### Request Tracing

Every request gets a unique `requestId` that appears in all logs. Use this to trace the full lifecycle of a request:

```bash
# Find all logs for a specific request
grep "req-abc123xyz" logs/combined-*.log
```

Example output:

```
[2025-11-25 10:30:15] info: → GET /api/listings [req-abc123xyz]
[2025-11-25 10:30:15] info: DB query: get_listings completed in 45ms [req-abc123xyz]
[2025-11-25 10:30:15] info: ← GET /api/listings → 200 (78ms) [req-abc123xyz]
```

### Security: Auto-Redacted Fields

The following fields are automatically redacted in logs:

- `password`
- `token`
- `sessionToken`
- `apiKey`
- `secret`

**Never log sensitive data manually!**

---

## Breakpoint Debugging

Use VS Code's built-in debugger to set breakpoints in server-side code.

### Method 1: Debug Terminal

1. Open command palette: `Ctrl+Shift+P` (Linux/Windows) or `Cmd+Shift+P` (Mac)
2. Select **"Debug: JavaScript Debug Terminal"**
3. Start your project in the debug terminal:
   ```bash
   npm run dev
   ```
4. Set breakpoints in `.ts` or `.svelte` files
5. Trigger the breakpoint by making requests

### Method 2: Launch Configuration

Create `.vscode/launch.json`:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"command": "npm run dev",
			"name": "Run development server",
			"request": "launch",
			"type": "node-terminal"
		}
	]
}
```

Then press `F5` to start debugging.

### Debugging Server-Side Code

**Example: Debugging API endpoint**

1. Set breakpoint in `src/routes/api/listings/+server.ts`
2. Make request: `curl http://localhost:5173/api/listings`
3. Execution pauses at breakpoint
4. Inspect variables, step through code

**Example: Debugging load function**

1. Set breakpoint in `src/routes/+page.server.ts`
2. Navigate to homepage in browser
3. Execution pauses at breakpoint

### Debugging Client-Side Code

Use browser DevTools:

1. Open browser DevTools (`F12`)
2. Navigate to **Sources** tab
3. Find your `.svelte` file (webpack://)
4. Set breakpoints in `<script>` sections
5. Trigger client-side logic

---

## Common Issues

### Issue 1: 500 Internal Server Error

**Symptoms**: Homepage or API endpoints return 500 status code

**Causes & Solutions**:

1. **Zod validation error**:

   ```bash
   # Check logs for validation errors
   tail -f logs/error-*.log
   ```

   Common issue: Empty string query params cause Zod to fail
   - Fix: Use `.transform()` to handle empty strings
   - See `listingQuerySchema` for example

2. **Database connection error**:

   ```bash
   # Check if database is running
   docker compose ps

   # Restart database if needed
   docker compose restart db
   ```

3. **Missing environment variables**:
   ```bash
   # Verify .env file exists and has required vars
   cat .env | grep DATABASE_URL
   ```

### Issue 2: 400 Bad Request on API Endpoints

**Symptoms**: `/api/listings` returns 400 with validation errors

**Debug steps**:

1. Check request payload:

   ```bash
   curl -v http://localhost:5173/api/listings?limit=abc
   ```

2. Review Zod schema for that endpoint:

   ```typescript
   // src/lib/types/app.schemas.ts
   export const listingQuerySchema = z.object({ ... });
   ```

3. Check logs for field-level validation errors:
   ```bash
   tail -f logs/combined-*.log | grep "validation_error"
   ```

### Issue 3: Database Migration Errors

**Symptoms**: Tables don't exist, schema drift detected

**Solutions**:

```bash
# Reset database and rerun migrations
npm run migrate:down
npm run migrate:up

# Check migration history
docker exec -it your-project-db psql -U root -d craigslist_dupe
SELECT * FROM public.migration_history ORDER BY executed_at DESC;
```

### Issue 4: CORS Errors (API calls fail from frontend)

**Symptoms**: Network errors in browser console

**Solution**: Ensure you're using the API client correctly:

```typescript
// ✅ Correct - uses server-side fetch
import { createApiClient } from '$lib/api/client';

export const load: PageServerLoad = async ({ fetch }) => {
	const api = createApiClient(fetch);
	const data = await api.listings.getAll();
	return { data };
};

// ❌ Wrong - causes CORS issues
export const load: PageServerLoad = async () => {
	const response = await fetch('http://localhost:5173/api/listings');
};
```

### Issue 5: Session/Auth Issues

**Symptoms**: User logged in but `locals.user` is null

**Debug**:

```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('auth_session');
	console.log('Session ID:', sessionId); // Add debug logging

	if (!sessionId) {
		console.log('No session cookie found');
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// ... rest of validation
};
```

Check browser cookies in DevTools → Application → Cookies

---

## Database Debugging

### Drizzle Studio (Visual Database Browser)

Best way to inspect database state:

```bash
npm run db:studio
```

Opens at `http://localhost:4983` with:

- Browse all tables
- View data
- Run queries
- Edit records (be careful!)

### PostgreSQL CLI

Connect directly to database:

```bash
docker exec -it your-project-db psql -U root -d craigslist_dupe
```

**Useful commands**:

```sql
-- List all schemas
\dn

-- List tables in a schema
\dt auth.*
\dt app.*
\dt master.*

-- Describe table structure
\d auth.user
\d app.listings

-- Check recent listings
SELECT id, title, created_at FROM app.listings ORDER BY created_at DESC LIMIT 5;

-- Check migration history
SELECT * FROM public.migration_history ORDER BY executed_at DESC;

-- Count records
SELECT
  (SELECT COUNT(*) FROM auth.user) as users,
  (SELECT COUNT(*) FROM app.listings) as listings,
  (SELECT COUNT(*) FROM master.categories) as categories;
```

### Query Logging

All database queries are automatically logged with timing:

```typescript
// Automatically logs slow queries (>200ms by default)
const listings = await db.select().from(listings).where(...);
```

View slow queries:

```bash
tail -f logs/combined-*.log | grep "slow query"
```

### Database Connection Issues

```bash
# Check if database container is running
docker compose ps

# View database logs
docker compose logs db

# Restart database
docker compose restart db

# Reset database completely
docker compose down -v
docker compose up -d
npm run migrate:up
npm run seed:up
```

---

## API Debugging

### cURL Testing

**Test GET endpoint**:

```bash
curl -v http://localhost:5173/api/listings
```

**Test POST endpoint**:

```bash
curl -X POST http://localhost:5173/api/listings \
  -H 'Content-Type: application/json' \
  -H 'Cookie: auth_session=YOUR_SESSION_ID' \
  -d '{
    "title": "Test Listing",
    "description": "This is a test listing for debugging",
    "categoryId": "UUID_HERE",
    "locationId": "UUID_HERE",
    "price": "99.99"
  }'
```

**Test with authentication**:

```bash
# 1. Login and extract session cookie
curl -c cookies.txt -X POST http://localhost:5173/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"testuser","password":"yourpassword"}'

# 2. Use cookie for authenticated requests
curl -b cookies.txt http://localhost:5173/api/users/me
```

### Postman / Insomnia

Import this collection structure:

```
YourApp Clone API
├── Auth
│   ├── POST /api/auth/register
│   ├── POST /api/auth/login
│   └── POST /api/auth/logout
├── Listings
│   ├── GET /api/listings
│   ├── GET /api/listings/:id
│   ├── POST /api/listings
│   ├── PATCH /api/listings/:id
│   └── DELETE /api/listings/:id
└── ...
```

### Inspect Request/Response

**In API endpoint code**:

```typescript
export async function POST(event: RequestEvent) {
	return withApiLogging(event, async ({ requestId }) => {
		const body = await event.request.json();

		// Debug: Log request body
		console.log('Request body:', JSON.stringify(body, null, 2));

		// Validate
		const result = schema.safeParse(body);

		if (!result.success) {
			// Debug: Log validation errors
			console.log('Validation errors:', result.error.errors);
			return ApiError.fromZod(result.error, requestId);
		}

		// ... process request
	});
}
```

### API Client Debugging

**Check what's being sent**:

```typescript
// src/lib/api/base.ts
export async function apiFetch<T>(
	fetch: typeof globalThis.fetch,
	url: string,
	init?: RequestInit
): Promise<T> {
	// Add debug logging
	console.log('API Request:', { url, method: init?.method, body: init?.body });

	const response = await fetch(url, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...init?.headers
		}
	});

	// Add debug logging
	console.log('API Response:', { status: response.status, ok: response.ok });

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Request failed' }));
		console.error('API Error:', error);
		throw new Error(error.message || `API error: ${response.status}`);
	}

	return response.json() as Promise<T>;
}
```

---

## Client-Side Debugging

### Browser DevTools

**Console logging**:

```svelte
<script lang="ts">
	let { data } = $props();

	// Debug reactive state
	$effect(() => {
		console.log('Data changed:', data);
	});

	function handleClick() {
		console.log('Button clicked');
	}
</script>
```

**Network tab**:

- View all API requests
- Inspect request/response headers
- See request payload and response data

**React DevTools** (for Svelte 5, use Svelte DevTools extension):

- Install: [Svelte DevTools](https://chrome.google.com/webstore/detail/svelte-devtools/ckolcbmkjpjmangdbmnkpjigpkddpogn)
- Inspect component state
- View component hierarchy

### Svelte Inspector ($inspect)

Use `$inspect` to debug reactive state:

```svelte
<script lang="ts">
	let count = $state(0);

	// Logs to console whenever count changes
	$inspect(count);

	// With label
	$inspect({ count, doubled: count * 2 }).with(console.log);
</script>
```

---

## Performance Debugging

### Slow Page Loads

1. **Check database query performance**:

   ```bash
   # View slow queries in logs
   tail -f logs/combined-*.log | grep "slow query"
   ```

2. **Profile with browser DevTools**:
   - Open DevTools → Performance tab
   - Record page load
   - Analyze waterfall

3. **Check for N+1 queries**:

   ```typescript
   // ❌ Bad - N+1 query problem
   const users = await db.select().from(users);
   for (const user of users) {
   	user.listings = await db.select().from(listings).where(eq(listings.userId, user.id));
   }

   // ✅ Good - Single join query
   const usersWithListings = await db
   	.select()
   	.from(users)
   	.leftJoin(listings, eq(users.id, listings.userId));
   ```

### Memory Leaks

Watch for:

- Unclosed database connections
- Event listeners not cleaned up
- Large objects in memory

**Use Node.js profiling**:

```bash
node --inspect-brk node_modules/.bin/vite dev
```

Then open `chrome://inspect` in Chrome.

### Bundle Size

```bash
# Analyze bundle size
npm run build
npm run preview

# Check build output
ls -lh build/
```

---

## Best Practices

### 1. Always Use Request IDs

Pass `requestId` to all logging functions:

```typescript
log.info('Action performed', {
	requestId, // ← Always include
	userId,
	operation: 'ACTION_NAME'
});
```

### 2. Log at Boundaries

Log when data enters/exits your application:

- API requests/responses
- Database queries
- External API calls

### 3. Use Structured Logging

```typescript
// ✅ Good - Structured metadata
log.info('User registered', {
	requestId,
	userId: user.id,
	operation: 'REGISTER',
	schema: 'auth'
});

// ❌ Bad - String concatenation
log.info(`User ${userId} registered`);
```

### 4. Test Error Paths

Deliberately trigger errors to ensure they're logged correctly:

```typescript
// Test validation error
curl -X POST http://localhost:5173/api/listings \
  -H 'Content-Type: application/json' \
  -d '{"title":"ab"}'  # Too short, should fail

# Check logs
tail -f logs/combined-*.log | grep "validation_error"
```

### 5. Use TypeScript

TypeScript catches many bugs at compile time:

```bash
npm run check  # Type-check entire project
```

---

## Troubleshooting Checklist

When encountering an issue:

- [ ] Check server logs (`tail -f logs/combined-*.log`)
- [ ] Check browser console for client-side errors
- [ ] Verify database is running (`docker compose ps`)
- [ ] Test API endpoint with cURL
- [ ] Check Zod schemas for validation issues
- [ ] Verify environment variables (`.env` file)
- [ ] Run type check (`npm run check`)
- [ ] Check migration status (`npm run migrate:status`)
- [ ] Search logs for requestId to trace full request lifecycle
- [ ] Use Drizzle Studio to inspect database state

---

## See Also

- **[Logging Documentation](LOGGER.md)** - Winston logger details
- **[API Documentation](API.md)** - API endpoint reference
- **[Database Architecture](DATABASE.md)** - Multi-schema database
- **[Error Handling](ERROR_HANDLING.md)** - Error response formats
- **[Development Guide](DEVELOPMENT.md)** - Development workflows
