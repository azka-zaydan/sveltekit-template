# API Error Handling

> **Note**: For AI agent guidance on validation and error handling, see [`.github/instructions/validation.instructions.md`](../.github/instructions/validation.instructions.md)

Standardized error handling system based on RFC 7807 Problem Details for HTTP APIs.

## Overview

This project uses a consistent, structured approach to API error responses that provides:

- **Machine-readable error types** for programmatic client-side handling
- **Human-readable messages** for user display
- **Field-level validation errors** for form feedback
- **Security considerations** to prevent information disclosure
- **Proper HTTP status codes** following REST conventions

## Error Response Format

All error responses follow this standardized structure:

```typescript
{
  type: string;           // Machine-readable error type (e.g., "validation_error")
  title: string;          // Human-readable error title
  detail: string;         // Detailed explanation
  status: number;         // HTTP status code (400-599)
  errors?: {              // Optional: field-level validation errors
    [field]: string[]     // Array of error messages per field
  },
  // Optional additional metadata (e.g., retryAfter for rate limits)
}
```

## Error Types

The system defines standard error types for consistent handling:

```typescript
const ErrorType = {
	VALIDATION_ERROR: 'validation_error', // 400
	AUTHENTICATION_ERROR: 'authentication_error', // 401
	AUTHORIZATION_ERROR: 'authorization_error', // 403
	RESOURCE_NOT_FOUND: 'resource_not_found', // 404
	RESOURCE_CONFLICT: 'resource_conflict', // 409
	RATE_LIMIT_ERROR: 'rate_limit_error', // 429
	INTERNAL_ERROR: 'internal_error' // 500
};
```

## Usage Examples

### Basic Error Responses

```typescript
import { ApiError } from '$lib/server/errors';

// 400 Bad Request
export async function POST(event) {
	return withApiLogging(event, async ({ requestId }) => {
		const data = await request.json();

		if (!data.title) {
			return ApiError.badRequest('Title is required', undefined, requestId);
		}

		// ... process request
	});
}

// 401 Unauthorized
if (!locals.user) {
	return ApiError.unauthorized('You must be logged in', requestId);
}

// 403 Forbidden
if (listing.userId !== locals.user.id) {
	return ApiError.forbidden('You can only edit your own listings', requestId);
}

// 404 Not Found
const user = await findUser(id);
if (!user) {
	return ApiError.notFound('User', requestId);
}

// 409 Conflict
if (await usernameExists(username)) {
	return ApiError.conflict('Username already taken', requestId);
}

// 429 Rate Limit
if (!rateLimitResult.allowed) {
	return ApiError.rateLimitExceeded(retryAfter, requestId);
}

// 500 Internal Error
try {
	// ... operation
} catch (error) {
	return ApiError.internal('Failed to process request', requestId);
}
```

### Validation Errors with Field-Level Feedback

```typescript
import { ApiError } from '$lib/server/errors';
import { registerSchema } from '$lib/types/auth.schemas';

export async function POST(event) {
	return withApiLogging(event, async ({ requestId }) => {
		const body = await request.json();

		// Validate with Zod schema
		const result = registerSchema.safeParse(body);

		if (!result.success) {
			// Automatically format Zod errors
			return ApiError.fromZod(result.error, requestId);
		}

		const { username, email, password } = result.data;
		// ... process valid data
	});
}
```

**Response example:**

```json
{
	"type": "validation_error",
	"title": "Validation Failed",
	"detail": "Request validation failed",
	"status": 400,
	"errors": {
		"username": ["Username must be 3-31 characters"],
		"email": ["Invalid email format"],
		"password": [
			"Password must be at least 12 characters with uppercase, lowercase, number, and special character"
		]
	}
}
```

### Custom Validation Errors

```typescript
import { ApiError } from '$lib/server/errors';
import { createListingSchema } from '$lib/types/app.schemas';

// Use Zod schema for validation
const result = createListingSchema.safeParse(data);

if (!result.success) {
	// ApiError.fromZod automatically formats Zod errors
	return ApiError.fromZod(result.error, requestId);
}

// Additional custom validation if needed
if (result.data.price < 0) {
	return ApiError.badRequest(
		'Price must be positive',
		[{ field: 'price', message: 'Price must be positive' }],
		requestId
	);
}
```

## Zod Schema Validation

This project uses Zod v4 for runtime type-safe validation. All validation schemas are in `src/lib/types/*.schemas.ts`:

```typescript
import { registerSchema } from '$lib/types/auth.schemas';
import { createListingSchema } from '$lib/types/app.schemas';
import { ApiError } from '$lib/server/errors';

// Validate with safeParse
const result = registerSchema.safeParse({
	username,
	email,
	password
});

if (!result.success) {
	// ApiError.fromZod formats Zod errors to standard format
	return ApiError.fromZod(result.error, requestId);
}

// Use validated data with inferred types
const validData: RegisterInput = result.data;
```

**Available schemas:**

- `src/lib/types/auth.schemas.ts` - Authentication (register, login)
- `src/lib/types/app.schemas.ts` - Listings, favorites, images
- `src/lib/types/master.schemas.ts` - Categories, locations
- `src/lib/types/common.schemas.ts` - Shared validators (UUID, pagination)

## Security Considerations

### 1. Prevent Username/Email Enumeration

**❌ Don't reveal which field caused a conflict:**

```typescript
// BAD - Reveals if username or email exists
if (error.detail?.includes('username')) {
	return json({ error: 'Username already exists' }, { status: 409 });
}
if (error.detail?.includes('email')) {
	return json({ error: 'Email already exists' }, { status: 409 });
}
```

**✅ Use generic conflict message:**

```typescript
// GOOD - Doesn't reveal which field exists
if (error.code === '23505') {
	return ApiError.conflict('An account with these credentials already exists', requestId);
}
```

### 2. Don't Leak Implementation Details

**❌ Don't expose internal errors:**

```typescript
// BAD - Exposes database/internal details
return json({ error: error.message }, { status: 500 });
```

**✅ Use generic internal error:**

```typescript
// GOOD - Generic message, log details server-side
log.error('Database error', { error, requestId });
return ApiError.internal('Failed to process request', requestId);
```

### 3. Validation Error Context

Validation errors are safe to expose in detail since they don't reveal system internals:

```typescript
// SAFE - Client needs this to fix their input
return ApiError.badRequest(
	'Validation failed',
	[
		{ field: 'email', message: 'Email must be valid' },
		{ field: 'password', message: 'Password too short' }
	],
	requestId
);
```

## HTTP Status Codes

Follow these conventions:

| Status | Meaning               | When to Use                                     |
| ------ | --------------------- | ----------------------------------------------- |
| `400`  | Bad Request           | Validation errors, malformed input              |
| `401`  | Unauthorized          | Authentication required or invalid              |
| `403`  | Forbidden             | Authenticated but insufficient permissions      |
| `404`  | Not Found             | Resource doesn't exist                          |
| `409`  | Conflict              | Resource already exists, state conflict         |
| `422`  | Unprocessable Entity  | Semantic validation errors (alternative to 400) |
| `429`  | Too Many Requests     | Rate limit exceeded                             |
| `500`  | Internal Server Error | Unexpected server errors                        |

## Client-Side Handling

Clients can handle errors programmatically using the error type:

```typescript
const response = await fetch('/api/auth/register', {
	method: 'POST',
	body: JSON.stringify({ username, email, password })
});

if (!response.ok) {
	const error = await response.json();

	switch (error.type) {
		case 'validation_error':
			// Show field-level errors
			for (const [field, messages] of Object.entries(error.errors || {})) {
				showFieldError(field, messages[0]);
			}
			break;

		case 'resource_conflict':
			showMessage(error.detail);
			break;

		case 'rate_limit_error':
			showMessage(`Too many attempts. Retry in ${error.retryAfter}s`);
			break;

		default:
			showMessage(error.detail || 'An error occurred');
	}
}
```

## Migration from Old Error Format

**Old format:**

```typescript
return json({ error: 'Username already exists' }, { status: 409 });
```

**New format:**

```typescript
return ApiError.conflict('An account with these credentials already exists', requestId);
```

**Old validation:**

```typescript
if (!username || username.length < 3) {
	return json({ error: 'Invalid username' }, { status: 400 });
}
```

**New validation with Zod:**

```typescript
import { registerSchema } from '$lib/types/auth.schemas';

const result = registerSchema.safeParse({ username, email, password });

if (!result.success) {
	return ApiError.fromZod(result.error, requestId);
}
```

## Best Practices

1. **Always pass requestId** - Enables request tracing in logs
2. **Use specific error types** - Helps clients handle errors appropriately
3. **Provide helpful details** - Guide users on how to fix the issue
4. **Don't leak sensitive info** - Be careful with error messages in production
5. **Log server errors** - Always log 500 errors with full context
6. **Validate early** - Check input before expensive operations
7. **Batch validation** - Return all validation errors at once, not just the first one

## Testing Error Responses

```bash
# Test validation errors
curl -X POST http://localhost:5173/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"ab","email":"invalid","password":"123"}'

# Expected response:
{
  "type": "validation_error",
  "title": "Invalid Request",
  "detail": "Validation failed",
  "status": 400,
  "errors": {
    "username": ["Username must be between 3 and 31 characters"],
    "email": ["Email must be a valid email address"],
    "password": ["Password must be at least 6 characters long"]
  }
}
```

## References

- [RFC 7807 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc7807)
- [HTTP Status Code Definitions](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [SvelteKit Error Handling](https://kit.svelte.dev/docs/errors)
