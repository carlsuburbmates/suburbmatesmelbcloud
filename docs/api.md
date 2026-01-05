NON-AUTHORITATIVE: For implementation, defer to docs/SSOT/**.

# API Documentation

This document describes the API for the SuburbMates Melbourne platform.

## Authentication

All API endpoints that require authentication expect a valid JWT token in the `Authorization` header, as provided by Supabase Auth.

## Conceptual Endpoints (Not Implemented)

The following endpoints are conceptual and do not reflect the current implementation. For the authoritative data model, see `docs/SSOT/USER_MODEL_AND_STATE_MACHINE.md`.

## Listings

### GET /api/listings

Returns a list of listings, sorted by the platform's ranking contract.

**Query Parameters:**

*   `categoryId` (optional): `number` - Filter listings by category ID.
*   `page` (optional): `number` - The page number for pagination (default: 1).
*   `pageSize` (optional): `number` - The number of items per page (default: 10).

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "category_id": "number",
    "creator_id": "uuid", // Formerly owner_id
    "status": "string", // e.g., 'Unclaimed', 'Live', 'Under Review'
    "is_verified": "boolean",
    "tier": "string",
    "featured_until": "timestamp",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### POST /api/listings

Creates a new listing. Requires authentication.

**Request Body:**

```json
{
  "name": "string",
  "description": "string" (optional),
  "category_id": "number"
}
```

## Products

### GET /api/products

Returns a list of products.

**Query Parameters:**

*   `listingId` (optional): `string` - Filter products by listing ID.
*   `page` (optional): `number` - The page number for pagination (default: 1).
*   `pageSize` (optional): `number` - The number of items per page (default: 10).

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": "number",
    "category_id": "number",
    "listing_id": "uuid", // Formerly business_id
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

## Categories

### GET /api/listing-categories

Returns a list of all listing categories.

### GET /api/product-categories

Returns a list of all product categories.

