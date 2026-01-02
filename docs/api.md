# API Documentation

This document describes the API for the SuburbMates Melbourne platform.

## Authentication

All API endpoints that require authentication expect a valid JWT token in the `Authorization` header, as provided by Supabase Auth.

## Businesses

### GET /api/businesses

Returns a list of businesses, sorted by the platform's ranking contract.

**Query Parameters:**

*   `categoryId` (optional): `number` - Filter businesses by category ID.
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
    "owner_id": "uuid",
    "is_claimed": "boolean",
    "is_verified": "boolean",
    "tier": "string",
    "featured_until": "timestamp",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### POST /api/businesses

Creates a new business. Requires authentication.

**Request Body:**

```json
{
  "name": "string",
  "description": "string" (optional),
  "category_id": "number"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "category_id": "number",
  "owner_id": "uuid",
  "is_claimed": true,
  "is_verified": false,
  "tier": "Basic",
  "featured_until": null,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Products

### GET /api/products

Returns a list of products.

**Query Parameters:**

*   `businessId` (optional): `string` - Filter products by business ID.
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
    "business_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### POST /api/products

Creates a new product. Requires authentication.

**Request Body:**

```json
{
  "name": "string",
  "description": "string" (optional),
  "price": "number",
  "category_id": "number",
  "business_id": "uuid"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "price": "number",
  "category_id": "number",
  "business_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Categories

### GET /api/business-categories

Returns a list of all business categories.

**Response (200 OK):**

```json
[
  {
    "id": "number",
    "name": "string"
  }
]
```

### GET /api/product-categories

Returns a list of all product categories.

**Response (200 OK):**

```json
[
  {
    "id": "number",
    "name": "string"
  }
]
```
