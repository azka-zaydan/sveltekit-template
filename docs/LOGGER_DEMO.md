# Logger & Error Handling Demo

Complete demonstration of the error handling and logging system in the SvelteKit template.

## Demo Pages

### 1. Form-Based Error Handling Demo

**URL**: `/demo/logger`

Demonstrates error handling in form actions (server-side form processing).

**Features**:

- Zod validation with field-level errors
- 401 Unauthorized (requires login)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (resource missing)
- 409 Conflict (duplicate resource)
- 500 Internal Server Error

**Files**:

- `/src/routes/demo/logger/+page.svelte` - Interactive UI
- `/src/routes/demo/logger/+page.server.ts` - Form actions

### 2. API Error Handling Demo

**URL**: `/demo/logger/api`

Demonstrates error handling in RESTful API endpoints.

**Features**:

- Success responses with `success()` and `created()` helpers
- All error types via query parameters (`?type=unauthorized`, etc.)
- POST validation with Zod schema
- Automatic console logging for all responses
- Interactive testing UI with fetch calls

**Files**:

- `/src/routes/demo/logger/api/+page.svelte` - Interactive testing UI
- `/src/routes/demo/logger/api/test/+server.ts` - API endpoint

## How to Use

1. **Start the dev server**:

   ```bash
   npm run dev
   ```

2. **Open the demos**:
   - Form demo: http://localhost:5173/demo/logger
   - API demo: http://localhost:5173/demo/logger/api

3. **Open browser console** (F12) to see logging output

4. **Click buttons** to trigger different error types

## Console Logging

The template uses simple console logging instead of Winston:

### Automatic Logging

All errors are automatically logged when using `ApiError` helpers:

```typescript
// 4xx errors → console.warn()
ApiError.badRequest('Invalid data', undefined, requestId);
ApiError.unauthorized('Login required', requestId);
ApiError.forbidden('No permission', requestId);
ApiError.notFound('User', requestId);
ApiError.conflict('Username taken', requestId);

// 5xx errors → console.error()
ApiError.internal('Database error', requestId);
```

### Expected Console Output

#### Validation Error (400)

```
console.warn: [req_123] 400 Bad Request - Validation failed
{
  type: 'validation_error',
  errors: {
    email: ['Invalid email address'],
    age: ['Must be at least 18 years old']
  }
}
```

#### Unauthorized (401)

```
console.warn: [req_123] 401 Unauthorized - You must be logged in
```

#### Internal Server Error (500)

```
console.error: [req_123] 500 Internal Server Error - Database connection failed
```

## Code Patterns

### Form Actions Pattern

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const schema = z.object({
	email: z.string().email('Invalid email')
});

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const result = schema.safeParse(data);

		if (!result.success) {
			// Extract field-level errors
			const errors: Record<string, string[]> = {};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as string;
				if (!errors[field]) errors[field] = [];
				errors[field].push(issue.message);
			});

			return fail(400, {
				message: 'Validation failed',
				...data,
				errors
			});
		}

		// Process valid data
		return { success: true };
	}
};
```

### API Endpoint Pattern

```typescript
// +server.ts
import { ApiError } from '$lib/server/errors';
import { success, created } from '$lib/server/responses';
import { z } from 'zod';

const schema = z.object({
	name: z.string().min(3)
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const requestId = crypto.randomUUID();

	// Check authentication
	if (!locals.user) {
		return ApiError.unauthorized('Login required', requestId);
	}

	const body = await request.json();
	const result = schema.safeParse(body);

	if (!result.success) {
		// Automatically extracts field errors and logs
		return ApiError.fromZod(result.error, requestId);
	}

	// Process data
	const item = await createItem(result.data);

	return created(item, 'Item created successfully');
};
```

## Helper Functions

### ApiError (from `$lib/server/errors`)

- `ApiError.badRequest(detail, errors?, requestId)` - 400
- `ApiError.unauthorized(detail, requestId)` - 401
- `ApiError.forbidden(detail, requestId)` - 403
- `ApiError.notFound(resourceType, requestId)` - 404
- `ApiError.conflict(detail, requestId)` - 409
- `ApiError.internal(detail, requestId)` - 500
- `ApiError.fromZod(zodError, requestId)` - 400 with field errors

### Success Responses (from `$lib/server/responses`)

- `success(data, message?, status?)` - Generic success (default 200)
- `created(data, message?)` - 201 Created
- `noContent()` - 204 No Content
- `paginated(data, pagination)` - Paginated response

## Error Response Structure

All errors follow RFC 7807 format:

```typescript
{
  type: 'validation_error',      // Error type
  title: 'Validation Failed',    // Human-readable title
  detail: 'Request validation failed',  // Detailed explanation
  status: 400,                    // HTTP status code
  errors?: {                      // Field-level errors (validation only)
    email: ['Invalid email format'],
    age: ['Must be at least 18']
  }
}
```

## Success Response Structure

All success responses follow this format:

```typescript
{
  success: true,
  data: { ... },           // Actual response data
  message?: string         // Optional message
}
```

## Tips

1. **Always validate on both sides**: Client-side for UX, server-side for security
2. **Use Zod schemas**: Single source of truth for validation rules
3. **Include requestId**: Helps trace errors across logs
4. **Use specific error types**: Helps clients handle errors appropriately
5. **Check browser console**: All errors are automatically logged there

## Next Steps

- Review `/docs/ERROR_HANDLING.md` for complete error handling guide
- Check `/docs/API.md` for API endpoint documentation
- See `/docs/DEVELOPMENT.md` for general development patterns
