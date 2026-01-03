# Search Contract

This document outlines the data sources and indexing strategies for the platform's search functionality.

## Discovery Philosophy

The platform is built on a **search-first discovery** model. The primary method for users to find listings and products is through the search bar. Browsing and filtering are secondary, supporting actions.

- **Categories are filters:** They are a fixed, top-level taxonomy used to narrow down a search to a broad area (e.g., "show me all 'Media Creation' businesses").
- **Tags are helpers:** They are a flexible, user-generated (or creator-generated) set of keywords that add detail and context to a listing or product. They help refine a search but are not the primary organizational structure.

## Implementation

Search will be implemented using **Postgres Full-Text Search (FTS) only**. No third-party or paid search services (e.g., Algolia, Elasticsearch) will be used.

## Indexed Fields

### Listings
- Name
- Description
- **Category Name** (from the canonical `categories` table)
- **Tag Names** (from the `tags` table)

### Products
- Name
- Description
- **Category Name** (from the canonical `categories` table)
- **Tag Names** (from the `tags` table)
