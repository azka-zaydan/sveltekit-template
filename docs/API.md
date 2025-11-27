# API Documentation

> **See also**: [`DEVELOPMENT.md`](DEVELOPMENT.md) for implementation details

This document serves as a reference for the internal API endpoints available in the application.

## API Standards

### Response Format

All API responses follow a standard JSON format:

**Success (2xx)**:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... } // Optional metadata (pagination, etc.)
}
```

**Error (4xx, 5xx)**:

```json
{
  "type": "validation_error",
  "title": "Validation Failed",
  "detail": "The provided data is invalid.",
  "status": 400,
  "errors": {
    "field": ["Error message"]
  }
}
```

### Authentication

Protected endpoints require a valid session cookie. The `hooks.server.ts` handles session validation and populates `locals.user`.

## Endpoints

### Auth (`/api/auth`)

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Create new account
- `POST /api/auth/logout` - Destroy session

### Items (`/api/items`)

- `GET /api/items` - List items (supports pagination, filtering)
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get item details
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Features (`/api/features`)

- `GET /api/features` - List features
- `POST /api/features` - Create feature

## Query Parameters

Standard query parameters for list endpoints:

- `limit` (number, default 20): Max records to return
- `offset` (number, default 0): Records to skip
- `sort` (string): Field to sort by (e.g., `createdAt`)
- `order` (string): `asc` or `desc`