# API Documentation

> **Note**: For AI agent guidance on API client usage, see [`.github/instructions/api-client.md`](../.github/instructions/api-client.md)

Complete reference for all API endpoints in the YourApp Clone application.

## Base URL

```
http://localhost:5173/api
```

## Authentication

Most endpoints use session-based authentication via HTTP-only cookies. The session cookie is automatically set upon successful login/registration and sent with subsequent requests.

**Protected endpoints** require authentication and will return `401 Unauthorized` if no valid session exists.

---

## 🔐 Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:

```json
{
	"username": "johndoe",
	"email": "john@example.com",
	"password": "securepassword123"
}
```

**Success Response** (201 Created):

```json
{
	"success": true,
	"user": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"username": "johndoe",
		"email": "john@example.com"
	}
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input (username/email/password format)
- `409 Conflict`: Username or email already exists

**Validation Rules**:

- Username: 3-31 characters, lowercase alphanumeric with underscore/hyphen only
- Email: Valid email format, max 255 characters
- Password: 12-255 characters, must include at least one uppercase letter, one lowercase letter, one number, and one special character

---

### Login User

Authenticate an existing user.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:

```json
{
	"username": "johndoe",
	"password": "securepassword123"
}
```

**Success Response** (200 OK):

```json
{
	"success": true,
	"user": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"username": "johndoe",
		"email": "john@example.com"
	}
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input format
- `401 Unauthorized`: Incorrect username or password

---

### Logout User

End the current user session.

**Endpoint**: `POST /api/auth/logout`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
	"success": true
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated

---

## 📝 Listings Endpoints

### List Listings

Retrieve a paginated list of listings with optional filters.

**Endpoint**: `GET /api/listings`

**Authentication**: Not required

**Query Parameters**:

- `category` (string, optional): Filter by category slug
- `location` (string, optional): Filter by location slug
- `search` (string, optional): Search in titles and descriptions
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Example Request**:

```
GET /api/listings?category=electronics&location=san-francisco&minPrice=100&maxPrice=1000&limit=10
```

**Success Response** (200 OK):

```json
{
	"listings": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"title": "iPhone 13 Pro",
			"description": "Excellent condition, barely used",
			"price": "799.99",
			"isPriceNegotiable": true,
			"isActive": true,
			"viewCount": 42,
			"createdAt": "2025-11-24T10:00:00Z",
			"category": {
				"id": "...",
				"name": "Electronics",
				"slug": "electronics"
			},
			"location": {
				"id": "...",
				"city": "San Francisco",
				"state": "CA",
				"country": "USA"
			},
			"imageUrl": "https://example.com/image.jpg"
		}
	],
	"total": 156,
	"limit": 10,
	"offset": 0
}
```

---

### Get Listing Details

Retrieve detailed information about a specific listing.

**Endpoint**: `GET /api/listings/:id`

**Authentication**: Not required

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"userId": "...",
	"title": "iPhone 13 Pro",
	"description": "Excellent condition, barely used. Includes original box and accessories.",
	"price": "799.99",
	"isPriceNegotiable": true,
	"contactEmail": "seller@example.com",
	"contactPhone": "+1-555-0123",
	"isActive": true,
	"viewCount": 43,
	"createdAt": "2025-11-24T10:00:00Z",
	"updatedAt": "2025-11-24T10:00:00Z",
	"expiresAt": "2025-12-24T10:00:00Z",
	"category": {
		"id": "...",
		"name": "Electronics",
		"slug": "electronics"
	},
	"location": {
		"id": "...",
		"city": "San Francisco",
		"state": "CA",
		"country": "USA"
	},
	"poster": {
		"id": "...",
		"name": "John Doe"
	},
	"images": [
		{
			"id": "...",
			"imageUrl": "https://example.com/image1.jpg",
			"displayOrder": 0
		},
		{
			"id": "...",
			"imageUrl": "https://example.com/image2.jpg",
			"displayOrder": 1
		}
	]
}
```

**Error Responses**:

- `404 Not Found`: Listing does not exist

**Note**: View count is automatically incremented on each request.

---

### Create Listing

Create a new listing.

**Endpoint**: `POST /api/listings`

**Authentication**: Required

**Request Body**:

```json
{
	"categoryId": "550e8400-e29b-41d4-a716-446655440000",
	"locationId": "650e8400-e29b-41d4-a716-446655440000",
	"title": "iPhone 13 Pro for sale",
	"description": "Excellent condition, barely used",
	"price": 799.99,
	"isPriceNegotiable": true,
	"contactEmail": "seller@example.com",
	"contactPhone": "+1-555-0123"
}
```

**Success Response** (201 Created):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"userId": "...",
	"categoryId": "...",
	"locationId": "...",
	"title": "iPhone 13 Pro for sale",
	"description": "Excellent condition, barely used",
	"price": "799.99",
	"isPriceNegotiable": true,
	"contactEmail": "seller@example.com",
	"contactPhone": "+1-555-0123",
	"isActive": true,
	"viewCount": 0,
	"createdAt": "2025-11-24T10:00:00Z",
	"expiresAt": "2025-12-24T10:00:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input or missing required fields
- `401 Unauthorized`: Not authenticated

**Notes**:

- Listings automatically expire after 30 days
- `contactEmail` defaults to user's email if not provided
- `price` is optional (for free items or "contact for price")

---

### Update Listing

Update an existing listing.

**Endpoint**: `PATCH /api/listings/:id`

**Authentication**: Required (must be listing owner)

**Request Body** (all fields optional):

```json
{
	"title": "Updated title",
	"description": "Updated description",
	"price": 699.99,
	"isPriceNegotiable": false,
	"contactEmail": "newemail@example.com",
	"contactPhone": "+1-555-9999",
	"isActive": true
}
```

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"title": "Updated title",
	"description": "Updated description",
	"price": "699.99",
	"isPriceNegotiable": false,
	"updatedAt": "2025-11-24T11:00:00Z"
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the listing owner
- `404 Not Found`: Listing does not exist

---

### Delete Listing

Delete a listing permanently.

**Endpoint**: `DELETE /api/listings/:id`

**Authentication**: Required (must be listing owner)

**Success Response** (204 No Content)

**Error Responses**:

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the listing owner
- `404 Not Found`: Listing does not exist

---

### Add Listing Images

Upload images for a listing.

**Endpoint**: `POST /api/listings/:id/images`

**Authentication**: Required (must be listing owner)

**Request Body**:

```json
{
	"images": [
		{
			"imageUrl": "https://example.com/image1.jpg",
			"displayOrder": 0
		},
		{
			"imageUrl": "https://example.com/image2.jpg",
			"displayOrder": 1
		}
	]
}
```

**Success Response** (201 Created):

```json
{
	"images": [
		{
			"id": "...",
			"listingId": "550e8400-e29b-41d4-a716-446655440000",
			"imageUrl": "https://example.com/image1.jpg",
			"displayOrder": 0,
			"createdAt": "2025-11-24T10:00:00Z"
		}
	]
}
```

---

### Delete Listing Image

Remove an image from a listing.

**Endpoint**: `DELETE /api/listings/:id/images?imageId=:imageId`

**Authentication**: Required (must be listing owner)

**Query Parameters**:

- `imageId` (required): ID of the image to delete

**Success Response** (204 No Content)

**Error Responses**:

- `400 Bad Request`: Missing imageId
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the listing owner
- `404 Not Found`: Image not found

---

## 📁 Categories Endpoints

### List Categories

Retrieve all categories.

**Endpoint**: `GET /api/categories`

**Authentication**: Not required

**Query Parameters**:

- `parentId` (string, optional): Filter by parent category ID (for subcategories)

**Success Response** (200 OK):

```json
[
	{
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"name": "Electronics",
		"slug": "electronics",
		"parentId": null,
		"createdAt": "2025-11-24T10:00:00Z"
	},
	{
		"id": "650e8400-e29b-41d4-a716-446655440000",
		"name": "Smartphones",
		"slug": "smartphones",
		"parentId": "550e8400-e29b-41d4-a716-446655440000",
		"createdAt": "2025-11-24T10:00:00Z"
	}
]
```

---

### Get Category by Slug

Retrieve a specific category by its slug.

**Endpoint**: `GET /api/categories/:slug`

**Authentication**: Not required

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"name": "Electronics",
	"slug": "electronics",
	"parentId": null,
	"createdAt": "2025-11-24T10:00:00Z"
}
```

**Error Responses**:

- `404 Not Found`: Category does not exist

---

## 📍 Locations Endpoints

### List Locations

Retrieve all locations.

**Endpoint**: `GET /api/locations`

**Authentication**: Not required

**Query Parameters**:

- `state` (string, optional): Filter by state
- `country` (string, optional): Filter by country
- `limit` (number, optional): Results per page (default: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response** (200 OK):

```json
[
	{
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"city": "San Francisco",
		"state": "CA",
		"country": "USA",
		"slug": "san-francisco-ca",
		"createdAt": "2025-11-24T10:00:00Z"
	}
]
```

---

### Get Location by Slug

Retrieve a specific location by its slug.

**Endpoint**: `GET /api/locations/:slug`

**Authentication**: Not required

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"city": "San Francisco",
	"state": "CA",
	"country": "USA",
	"slug": "san-francisco-ca",
	"createdAt": "2025-11-24T10:00:00Z"
}
```

**Error Responses**:

- `404 Not Found`: Location does not exist

---

## ⭐ Favorites Endpoints

### Get User Favorites

Retrieve the authenticated user's favorite listings.

**Endpoint**: `GET /api/favorites`

**Authentication**: Required

**Query Parameters**:

- `listingId` (string, optional): Check if a specific listing is favorited

**Success Response** (200 OK):

```json
[
	{
		"favoriteId": "550e8400-e29b-41d4-a716-446655440000",
		"createdAt": "2025-11-24T10:00:00Z",
		"listing": {
			"id": "...",
			"title": "iPhone 13 Pro",
			"description": "Excellent condition",
			"price": "799.99",
			"isPriceNegotiable": true,
			"isActive": true,
			"viewCount": 42,
			"createdAt": "2025-11-23T10:00:00Z",
			"category": {
				"id": "...",
				"name": "Electronics",
				"slug": "electronics"
			},
			"location": {
				"id": "...",
				"city": "San Francisco",
				"state": "CA"
			}
		}
	}
]
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated

---

### Add to Favorites

Add a listing to the user's favorites.

**Endpoint**: `POST /api/favorites`

**Authentication**: Required

**Request Body**:

```json
{
	"listingId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response** (201 Created):

```json
{
	"id": "650e8400-e29b-41d4-a716-446655440000",
	"userId": "...",
	"listingId": "550e8400-e29b-41d4-a716-446655440000",
	"createdAt": "2025-11-24T10:00:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Listing already in favorites or invalid listingId
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Listing does not exist

---

### Remove from Favorites

Remove a listing from the user's favorites.

**Endpoint**: `DELETE /api/favorites/:listingId`

**Authentication**: Required

**Success Response** (204 No Content)

**Error Responses**:

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Favorite not found

---

## 👤 Users Endpoints

### Get Current User

Retrieve the authenticated user's profile.

**Endpoint**: `GET /api/users/me`

**Authentication**: Required

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"username": "johndoe",
	"email": "john@example.com",
	"name": "John Doe",
	"phoneNumber": "+1-555-0123",
	"createdAt": "2025-11-01T10:00:00Z",
	"updatedAt": "2025-11-24T10:00:00Z"
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated

---

### Update Current User

Update the authenticated user's profile.

**Endpoint**: `PATCH /api/users/me`

**Authentication**: Required

**Request Body** (all fields optional):

```json
{
	"name": "John Smith",
	"phoneNumber": "+1-555-9999"
}
```

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"name": "John Smith",
	"phoneNumber": "+1-555-9999",
	"updatedAt": "2025-11-24T11:00:00Z"
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated

---

### Get User Profile

Retrieve a user's public profile (limited information).

**Endpoint**: `GET /api/users/:id`

**Authentication**: Not required

**Success Response** (200 OK):

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"name": "John Doe",
	"createdAt": "2025-11-01T10:00:00Z"
}
```

**Error Responses**:

- `404 Not Found`: User does not exist

**Note**: Email and phone number are not exposed for privacy.

---

### Get User Listings

Retrieve all listings posted by a specific user.

**Endpoint**: `GET /api/users/:id/listings`

**Authentication**: Not required

**Query Parameters**:

- `limit` (number, optional): Results per page (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Success Response** (200 OK):

```json
{
	"listings": [
		{
			"id": "...",
			"title": "iPhone 13 Pro",
			"description": "Excellent condition",
			"price": "799.99",
			"isActive": true,
			"createdAt": "2025-11-24T10:00:00Z",
			"category": {
				"name": "Electronics"
			},
			"location": {
				"city": "San Francisco",
				"state": "CA"
			}
		}
	],
	"total": 12
}
```

**Error Responses**:

- `404 Not Found`: User does not exist

---

## Error Response Format

All error responses follow this structure:

```json
{
	"error": "Description of what went wrong"
}
```

## HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded with no response body
- `400 Bad Request`: Invalid input or request format
- `401 Unauthorized`: Authentication required or invalid credentials
- `403 Forbidden`: Authenticated but not authorized for this action
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Resource already exists (duplicate)
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.
