# Winston Logger Library

The SvelteKit template now includes a production-ready Winston logger library with structured logging, daily rotation, and environment-based configuration.

## Features

- ✅ **Winston 3.x** - Industry-standard logging library
- ✅ **Daily Log Rotation** - Automatic file rotation with configurable retention
- ✅ **Structured Metadata** - Type-safe logging with requestId, userId, operation, schema, etc.
- ✅ **Environment-Based** - Different formats for development (colorized) vs production (JSON)
- ✅ **Sensitive Data Redaction** - Automatic redaction of passwords, tokens, API keys
- ✅ **Multiple Transports** - Console (always) + File transports (optional)
- ✅ **Type-Safe Helpers** - log.error, log.warn, log.info, log.http, log.debug

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Logging Configuration
LOG_LEVEL=debug              # debug | info | warn | error (default: info in prod, debug in dev)
LOG_TO_FILE=false            # Enable file-based logging (default: false)
LOG_DIR=logs                 # Directory for log files (default: logs)
LOG_MAX_SIZE=10m             # Max file size before rotation (default: 10m)
LOG_MAX_FILES=7d             # Keep logs for N days (default: 7d for combined, 14d for errors)

# Environment
NODE_ENV=development         # development | production
```

### Log Levels

Winston uses npm log levels (highest to lowest priority):

- `error` - Critical errors requiring immediate attention
- `warn` - Warnings (slow queries, 4xx responses)
- `http` - HTTP request/response tracking
- `info` - General informational messages
- `debug` - Detailed debugging (development only)
- `verbose` - Very detailed debugging
- `silly` - Extremely detailed debugging

## Usage

### Basic Logging

```typescript
import { log } from '$lib/server/logger';

// Simple messages
log.info('User logged in');
log.error('Database connection failed');
log.warn('Slow query detected');

// With structured metadata
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

### Type-Safe Metadata

```typescript
import type { LogMetadata } from '$lib/server/logger';

const metadata: LogMetadata = {
	requestId: 'req-123456',
	userId: 'user-789',
	schema: 'app', // 'auth' | 'app' | 'master' | 'public'
	operation: 'CREATE_LISTING',
	duration: 245,
	statusCode: 201,
	path: '/api/listings',
	method: 'POST',
	userAgent: 'Mozilla/5.0...',
	ip: '127.0.0.1'
};

log.info('Request completed', metadata);
```

### Helper Functions

#### Slow Query Detection

```typescript
import { logSlowQuery } from '$lib/server/logger';

const startTime = performance.now();
const results = await db.select().from(listings).where(...);
const duration = Math.round(performance.now() - startTime);

// Warns if query takes longer than 1000ms
logSlowQuery('fetch_active_listings', duration, 1000);

// Custom threshold
logSlowQuery('complex_join', duration, 2000, { schema: 'app' });
```

#### Migration Logging

```typescript
import { logMigration } from '$lib/server/logger';

const startTime = performance.now();
// Run migration...
const duration = Math.round(performance.now() - startTime);

logMigration('UP', '20251124_create_users.up.sql', duration, true);
```

## Log Formats

### Development (Colorized Console)

```
[2025-11-24 10:30:45] info: User logged in
  requestId: req-abc123xyz789
  userId: a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6
  operation: LOGIN_SUCCESS
  schema: auth
  duration: 245ms
```

### Production (JSON)

```json
{
	"timestamp": "2025-11-24T10:30:45.123Z",
	"level": "info",
	"message": "User logged in",
	"requestId": "req-abc123xyz789",
	"userId": "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
	"operation": "LOGIN_SUCCESS",
	"schema": "auth",
	"duration": 245
}
```

## File Transports

When `LOG_TO_FILE=true`, logs are written to:

```
logs/
├── combined-2025-11-24.log    # All logs
├── error-2025-11-24.log       # Error-level logs only (14d retention)
└── http-2025-11-24.log        # HTTP requests/responses (7d retention)
```

### Rotation Policy

- **Daily rotation** - New file created each day
- **Max file size** - Configurable (default 10MB)
- **Retention period**:
  - Combined logs: 7 days (configurable)
  - Error logs: 14 days (longer retention)
  - HTTP logs: 7 days (configurable)

## Integration with ApiError

The `ApiError` utilities automatically use the logger:

```typescript
import { ApiError } from '$lib/server/errors';

export async function POST(event) {
	const { locals } = event;

	// Authentication error (logged as warning)
	if (!locals.user) {
		return ApiError.unauthorized('You must be logged in', requestId);
		// Automatically logs: [API Error] Unauthorized (400)
	}

	// Server error (logged as error)
	try {
		await processData();
	} catch (error) {
		return ApiError.internal('Failed to process request', requestId);
		// Automatically logs: [API Error] Internal Server Error (500)
	}
}
```

## Security Features

### Automatic Redaction

Sensitive fields are automatically redacted in all log outputs:

```typescript
log.info('User registered', {
	username: 'john',
	email: 'john@example.com',
	password: 'secret123', // Will be [REDACTED]
	token: 'abc123', // Will be [REDACTED]
	apiKey: 'key123' // Will be [REDACTED]
});
```

**Redacted fields**: `password`, `token`, `sessionToken`, `apiKey`, `secret`

### Server-Only

The logger is located in `$lib/server/logger` and is automatically excluded from client bundles by SvelteKit.

## Best Practices

### 1. Use Structured Metadata

```typescript
// ✅ Good - structured metadata
log.info('Listing created', {
	listingId,
	userId,
	category,
	operation: 'CREATE_LISTING'
});

// ❌ Bad - string concatenation
log.info(`Listing ${listingId} created by ${userId} in ${category}`);
```

### 2. Include Request Context

```typescript
// ✅ Good - always include requestId
log.info('Processing payment', {
	requestId: event.locals.requestId,
	userId: event.locals.user?.id
});

// ❌ Bad - missing context
log.info('Processing payment');
```

### 3. Use Appropriate Log Levels

```typescript
log.error('Database connection failed'); // Requires immediate attention
log.warn('Query took 1500ms'); // Should be investigated
log.info('User logged in'); // Normal business operation
log.http('GET /api/listings - 200'); // Request tracking
log.debug('Cache hit for key: users'); // Development debugging
```

### 4. Don't Log in Loops

```typescript
// ❌ Bad - logs 100 times
listings.forEach((l) => log.debug('Processing', { listingId: l.id }));

// ✅ Good - log once with summary
log.debug('Processing listings', {
	count: listings.length,
	ids: listings.map((l) => l.id)
});
```

## Examples

### API Route with Logging

```typescript
import { log } from '$lib/server/logger';

export async function POST({ request, locals }) {
	const requestId = crypto.randomUUID();

	log.http('→ POST /api/listings', {
		requestId,
		userId: locals.user?.id
	});

	const startTime = performance.now();

	try {
		const listing = await createListing(request);
		const duration = Math.round(performance.now() - startTime);

		log.info('Listing created', {
			requestId,
			userId: locals.user.id,
			listingId: listing.id,
			operation: 'CREATE_LISTING',
			schema: 'app',
			duration
		});

		log.http('← POST /api/listings - 201', {
			requestId,
			statusCode: 201,
			duration
		});

		return json({ listing }, { status: 201 });
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		log.error('Failed to create listing', {
			requestId,
			userId: locals.user?.id,
			operation: 'CREATE_LISTING',
			schema: 'app',
			duration,
			error: error instanceof Error ? error.message : 'Unknown error'
		});

		return ApiError.internal('Failed to create listing', requestId);
	}
}
```

### Database Query with Slow Query Detection

```typescript
import { log, logSlowQuery } from '$lib/server/logger';

export async function getActiveListings() {
	const startTime = performance.now();

	log.debug('Fetching active listings', {
		operation: 'GET_ACTIVE_LISTINGS',
		schema: 'app'
	});

	const listings = await db.select().from(listings).where(eq(listings.isActive, true));

	const duration = Math.round(performance.now() - startTime);

	// Automatically warns if > 1000ms
	logSlowQuery('get_active_listings', duration, 1000, {
		schema: 'app',
		resultCount: listings.length
	});

	return listings;
}
```

## Troubleshooting

### Logs Not Appearing?

1. Check `LOG_LEVEL` environment variable
2. Ensure `NODE_ENV` is set correctly
3. Verify logger is imported from `$lib/server/logger`

### File Logs Not Created?

1. Ensure `LOG_TO_FILE=true` in `.env`
2. Check write permissions on `LOG_DIR` directory
3. Verify `winston-daily-rotate-file` is installed

### Too Verbose in Production?

1. Set `LOG_LEVEL=info` or `LOG_LEVEL=warn`
2. Disable debug/http levels
3. Adjust file transport levels in `config.ts`

## Migration from Console

If you have existing `console.log` statements:

```typescript
// Before
console.log('User registered:', userId);
console.error('Registration error:', error);

// After
import { log } from '$lib/server/logger';

log.info('User registered', { userId, operation: 'REGISTER' });
log.error('Registration failed', error);
```

## See Also

- [Winston Documentation](https://github.com/winstonjs/winston)
- [winston-daily-rotate-file](https://github.com/winstonjs/winston-daily-rotate-file)
- `/docs/ERROR_HANDLING.md` - Error handling integration
- `/demo/logger` - Interactive error handling examples
