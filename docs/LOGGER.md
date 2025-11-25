# Winston Logger Documentation

> **Note**: For AI agent usage, see [`.github/instructions/logging.md`](../.github/instructions/logging.md)

## Overview

Production-ready Winston logger for the YourApp clone with automatic API request/response tracking, multi-schema database logging, and environment-aware configuration.

## Features

- ✅ **Environment-aware formatting**: Colorized console (dev) vs JSON (production)
- ✅ **Automatic request tracking**: All HTTP requests logged with timing in `hooks.server.ts`
- ✅ **Request ID tracking**: Unique ID for each request across the entire flow
- ✅ **File rotation**: Daily log files with size limits and retention policies
- ✅ **Sensitive data sanitization**: Auto-redacts passwords, tokens, API keys
- ✅ **Type-safe logging**: TypeScript interfaces for metadata
- ✅ **Multi-transport**: Console + file logging (optional)
- ✅ **Database query wrappers**: `withQueryLogging`, `withTransaction`
- ✅ **API route wrappers**: `withApiLogging` with automatic error handling

## Configuration

Add to your `.env` file:

```env
LOG_LEVEL=debug              # debug | info | warn | error
LOG_TO_FILE=false            # Enable file-based logging
LOG_DIR=logs                 # Directory for log files
LOG_MAX_SIZE=10m             # Max file size before rotation
LOG_MAX_FILES=7d             # Keep logs for N days
NODE_ENV=development         # development | production
```

## Log Levels

Winston uses npm log levels (highest to lowest priority):

- `error`: Critical errors (auth failures, DB crashes)
- `warn`: Warnings (slow queries, deprecated APIs, 4xx responses)
- `http`: HTTP request/response tracking
- `info`: General informational messages (listing created, user logged in)
- `debug`: Detailed debugging (only in development)

## Usage

### Basic Logging

```typescript
import { log } from '$lib/server/logger';

// Simple messages
log.info('User logged in');
log.error('Database connection failed');
log.warn('Slow query detected');

// With metadata
log.info('Listing created', {
	userId: user.id,
	listingId: listing.id,
	schema: 'app',
	operation: 'CREATE_LISTING',
	category: 'vehicles'
});

// Error logging with stack traces
try {
	await someOperation();
} catch (error) {
	log.error('Operation failed', error); // Automatically logs stack trace
}
```

### API Route Logging (Recommended)

Use the `logApiRequest` helper for automatic request/response tracking:

```typescript
// src/routes/api/listings/+server.ts
import { logApiRequest } from '$lib/server/logger/middleware';
import { json } from '@sveltejs/kit';

export async function POST(event) {
	return logApiRequest(event, async () => {
		// Your handler logic here
		const listing = await createListing(event);

		return json({ listing }, { status: 201 });
	});
}
```

This automatically logs:

- Incoming request with method, path, IP, user agent
- Response with status code, duration
- Errors with stack traces

### Custom Status Code Logging

For non-standard responses:

```typescript
import { logApiResponse, getRequestContext } from '$lib/server/logger/middleware';

export async function GET(event) {
	const startTime = performance.now();

	// ... your logic ...

	const duration = Math.round(performance.now() - startTime);

	if (!listing) {
		logApiResponse(event, 404, duration, { listingId });
		return json({ error: 'Not found' }, { status: 404 });
	}

	logApiResponse(event, 200, duration);
	return json({ listing });
}
```

### Database Query Logging

For slow query detection:

```typescript
import { logSlowQuery } from '$lib/server/logger';

const startTime = performance.now();
const results = await db.select().from(listings).where(...);
const duration = Math.round(performance.now() - startTime);

logSlowQuery('fetch_active_listings', duration, 1000); // Warns if > 1000ms
```

### Migration Logging

```typescript
import { logMigration } from '$lib/server/logger';

const startTime = performance.now();
// Run migration...
const duration = Math.round(performance.now() - startTime);

logMigration('UP', '20251124_create_users.up.sql', duration, true);
```

## Log Output Examples

### Development (Console)

```
[2025-11-24 10:30:45] http: → POST /api/listings
  requestId: req_abc123xyz789
  method: POST
  path: /api/listings
  ip: 127.0.0.1

[2025-11-24 10:30:45] info: Listing created
  requestId: req_abc123xyz789
  userId: a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6
  operation: CREATE_LISTING
  schema: app
  listingId: x9y8z7w6-5v4u-3t2s-1r0q-p9o8n7m6l5k4
  category: vehicles

[2025-11-24 10:30:46] http: ← POST /api/listings - 201
  requestId: req_abc123xyz789
  userId: a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6
  method: POST
  path: /api/listings
  statusCode: 201
  duration: 245ms
```

### Production (JSON)

```json
{
  "timestamp": "2025-11-24T10:30:45.123Z",
  "level": "http",
  "message": "→ POST /api/listings",
  "requestId": "req_abc123xyz789",
  "method": "POST",
  "path": "/api/listings",
  "ip": "203.0.113.42"
}

{
  "timestamp": "2025-11-24T10:30:46.456Z",
  "level": "http",
  "message": "← POST /api/listings - 201",
  "requestId": "req_abc123xyz789",
  "userId": "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
  "method": "POST",
  "path": "/api/listings",
  "statusCode": 201,
  "duration": 245
}
```

## File Structure

When `LOG_TO_FILE=true`:

```
logs/
├── combined-2025-11-24.log    # All logs
├── error-2025-11-24.log       # Errors only (kept longer)
└── http-2025-11-24.log        # HTTP requests/responses
```

## Metadata Interface

```typescript
interface LogMetadata {
	requestId?: string; // Unique request identifier
	userId?: string; // User performing action
	schema?: 'auth' | 'app' | 'master' | 'public'; // DB schema
	operation?: string; // HIGH_LEVEL_OPERATION
	duration?: number; // Time in milliseconds
	statusCode?: number; // HTTP status
	path?: string; // Request path
	method?: string; // HTTP method
	userAgent?: string; // User agent
	ip?: string; // Client IP
	[key: string]: unknown; // Additional fields
}
```

## Best Practices

1. **Use structured metadata** instead of string concatenation:

   ```typescript
   // ✅ Good
   log.info('Listing created', { listingId, userId, category });

   // ❌ Bad
   log.info(`Listing ${listingId} created by ${userId} in ${category}`);
   ```

2. **Include requestId** in all logs within a request context:

   ```typescript
   log.info('Processing payment', {
   	requestId: event.locals.requestId,
   	userId: event.locals.user?.id
   });
   ```

3. **Log operations at boundaries**:
   - API entry/exit
   - Database queries
   - External API calls
   - Critical business logic

4. **Don't log in loops** - aggregate instead:

   ```typescript
   // ❌ Bad
   listings.forEach((l) => log.debug('Processing', { listingId: l.id }));

   // ✅ Good
   log.debug('Processing listings', { count: listings.length, ids: listings.map((l) => l.id) });
   ```

5. **Use appropriate log levels**:
   - `error`: Requires immediate attention
   - `warn`: Should be investigated
   - `info`: Normal business operations
   - `http`: Request/response tracking
   - `debug`: Development debugging only

## Automatic Request Tracking

All requests are automatically logged in `hooks.server.ts`:

- **Incoming**: `→ METHOD /path` with requestId, IP, user agent
- **Outgoing**: `← METHOD /path - STATUS` with duration, userId
- **Errors**: `✖ METHOD /path - Error` with stack trace

No manual logging needed for basic request tracking!

## Security

- **Auto-redaction**: Fields named `password`, `token`, `sessionToken`, `apiKey` are automatically replaced with `[REDACTED]`
- **Server-only**: Logger lives in `$lib/server/logger` and is never included in client bundles
- **IP privacy**: Consider masking IPs in production for GDPR compliance

## Performance

- **Async I/O**: File writes don't block request processing
- **Conditional formatting**: JSON formatting only in production
- **Log rotation**: Prevents disk space issues
- **Level filtering**: Debug logs disabled in production

## Migration from console.log

Replace existing `console.*` calls:

```typescript
// Before
console.log('User registered:', userId);
console.error('Registration error:', error);

// After
import { log } from '$lib/server/logger';

log.info('User registered', { userId, operation: 'REGISTER' });
log.error('Registration failed', error);
```

## Troubleshooting

**Logs not appearing?**

- Check `LOG_LEVEL` - set to `debug` for development
- Verify Winston is imported from `$lib/server/logger`

**File logs not created?**

- Ensure `LOG_TO_FILE=true` in `.env`
- Check write permissions on `LOG_DIR` directory

**Too verbose in production?**

- Set `LOG_LEVEL=info` or `LOG_LEVEL=warn`
- Disable debug/http levels

**Performance issues?**

- Disable file logging with `LOG_TO_FILE=false`
- Increase `LOG_MAX_SIZE` and `LOG_MAX_FILES` limits

---

## Recommended Wrappers (Best Practices)

### 1. API Route Wrapper: `withApiLogging`

Complete API route wrapper with automatic error handling and response formatting:

```typescript
// src/routes/api/users/[id]/+server.ts
import { withApiLogging } from '$lib/server/logger/middleware';
import { withQueryLogging } from '$lib/server/logger/db';
import { error } from '@sveltejs/kit';

export async function GET(event) {
	return withApiLogging(
		event,
		async ({ requestId, userId }) => {
			const { id } = event.params;

			const user = await withQueryLogging(
				'get_user_by_id',
				() => db.select().from(users).where(eq(users.id, id)).limit(1),
				{ requestId, schema: 'auth' }
			);

			if (!user[0]) {
				error(404, 'User not found');
			}

			// Return plain object - automatically wrapped in json()
			return { user: user[0] };
		},
		{
			operation: 'GET_USER',
			schema: 'auth'
		}
	);
}
```

**Automatically logs:**

```
→ GET /api/users/123
Database query: get_user_by_id (23ms)
← GET /api/users/123 - 200 (28ms)
```

### 2. Database Query Wrapper: `withQueryLogging`

Track database query performance automatically:

```typescript
import { withQueryLogging } from '$lib/server/logger/db';

const listings = await withQueryLogging(
	'get_active_listings',
	() => db.select().from(listings).where(eq(listings.status, 'active')),
	{
		requestId: locals.requestId,
		schema: 'app',
		warnThresholdMs: 500 // Warn if query takes longer than 500ms
	}
);
```

### 3. Transaction Wrapper: `withTransaction`

Log database transactions with automatic rollback on errors:

```typescript
import { withTransaction } from '$lib/server/logger/db';
import { db } from '$lib/server/db';

const result = await withTransaction(
	db,
	'create_listing_with_images',
	async (tx) => {
		const listing = await tx.insert(listings).values(data).returning();
		await tx.insert(listingImages).values(images);
		return listing[0];
	},
	{
		requestId: locals.requestId,
		schema: 'app'
	}
);
```

---

## Practical Examples

### Example 1: API Route with Validation

```typescript
// src/routes/api/listings/+server.ts
import { withApiLogging } from '$lib/server/logger/middleware';
import { createListingSchema } from '$lib/types/app.schemas';
import { ApiError } from '$lib/server/errors';

export async function POST(event) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const body = await event.request.json();

			// Validate with Zod
			const result = createListingSchema.safeParse(body);
			if (!result.success) {
				throw ApiError.fromZod(result.error, requestId);
			}

			const listing = await createListing(result.data, event.locals.user.id);

			return { listing };
		},
		{
			operation: 'CREATE_LISTING',
			schema: 'app'
		}
	);
}
```

### Example 2: Authentication with Detailed Logging

```typescript
// src/routes/api/auth/login/+server.ts
import { log } from '$lib/server/logger';
import { withApiLogging } from '$lib/server/logger/middleware';

export async function POST(event) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const { email, password } = await event.request.json();

			log.debug('Login attempt', {
				requestId,
				operation: 'LOGIN_ATTEMPT',
				schema: 'auth',
				email
			});

			const user = await getUserByEmail(email);

			if (!user) {
				log.warn('Login failed: user not found', {
					requestId,
					operation: 'LOGIN_FAILED',
					schema: 'auth',
					reason: 'user_not_found',
					email
				});
				throw new ApiError('Invalid credentials', 401, requestId);
			}

			const validPassword = await verifyPassword(user.passwordHash, password);

			if (!validPassword) {
				log.warn('Login failed: invalid password', {
					requestId,
					userId: user.id,
					operation: 'LOGIN_FAILED',
					schema: 'auth',
					reason: 'invalid_password'
				});
				throw new ApiError('Invalid credentials', 401, requestId);
			}

			log.info('User logged in', {
				requestId,
				userId: user.id,
				operation: 'LOGIN_SUCCESS',
				schema: 'auth'
			});

			// Create session and return...
			return { user };
		},
		{ operation: 'LOGIN', schema: 'auth' }
	);
}
```

### Example 3: Bulk Operations (Avoid Loop Logging)

```typescript
// ❌ BAD - logs 100 times
listings.forEach((listing) => {
	log.debug('Processing listing', { listingId: listing.id });
	processListing(listing);
});

// ✅ GOOD - logs once with summary
const startTime = performance.now();
const processedIds = listings.map((listing) => {
	processListing(listing);
	return listing.id;
});
const duration = Math.round(performance.now() - startTime);

log.info('Bulk listing processing complete', {
	requestId: locals.requestId,
	operation: 'BULK_PROCESS_LISTINGS',
	count: listings.length,
	duration
});
```

### Example 4: Error Handling with Stack Traces

```typescript
import { log } from '$lib/server/logger';

try {
	await someOperation();
} catch (error) {
	if (error instanceof Error) {
		// Automatically logs full stack trace
		log.error('Operation failed', {
			requestId: locals.requestId,
			operation: 'SOME_OPERATION',
			schema: 'app',
			error: error.message,
			stack: error.stack
		});
	}
	throw error; // Re-throw after logging
}
```

---

## Production JSON Output

With `NODE_ENV=production`, logs are formatted as JSON for log aggregation:

```json
{
  "timestamp": "2025-11-24T10:30:45.123Z",
  "level": "http",
  "message": "→ POST /api/auth/register",
  "requestId": "req_abc123xyz",
  "method": "POST",
  "path": "/api/auth/register",
  "ip": "127.0.0.1"
}

{
  "timestamp": "2025-11-24T10:30:45.234Z",
  "level": "warn",
  "message": "Registration failed: invalid password",
  "requestId": "req_abc123xyz",
  "operation": "REGISTER_VALIDATION_FAILED",
  "schema": "auth",
  "reason": "invalid_password"
}
```

Perfect for CloudWatch, Datadog, or ELK stack!

---

## See Also

- **AI Agent Reference**: [`.github/instructions/logging.md`](../.github/instructions/logging.md) - Quick reference for Copilot
- **Error Handling**: [`ERROR_HANDLING.md`](ERROR_HANDLING.md) - ApiError integration
- **API Documentation**: [`API.md`](API.md) - API endpoint patterns
- **Database Logging**: See `withQueryLogging` and `withTransaction` wrappers above

- Reduce log frequency in hot paths
- Increase `LOG_MAX_SIZE` to reduce rotation frequency
- Consider external log aggregation (CloudWatch, Datadog)
