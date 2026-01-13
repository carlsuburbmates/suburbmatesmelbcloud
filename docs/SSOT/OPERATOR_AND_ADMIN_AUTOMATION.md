# Operator & Admin Automation Manual

**Status:** ACTIVE
**Scope:** Database Automations (Triggers, Functions, Crons)

## 1. Safety Automations (Triggers)
These rules are enforced at the database level. No API can bypass them.

| Trigger Name | Table | Event | Logic Enforced |
| :--- | :--- | :--- | :--- |
| `check_product_limit_trigger` | `products` | INSERT | **Tier Limits:** Stops 'Basic' listings from adding >3 products. |
| `listings_check_category_type` | `listings` | INS/UPD | **Taxonomy purity:** Listings must use 'business' categories. |
| `products_check_category_type` | `products` | INS/UPD | **Taxonomy purity:** Products must use 'product' categories. |
| `listing_tags_check_limit` | `listing_tags` | INSERT | **Spam Prevention:** Max 3 tags per listing. |
| `product_tags_check_limit` | `product_tags` | INSERT | **Spam Prevention:** Max 3 tags per product. |

## 2. Operational Automations (Functions)
These functions power the core business logic.

| Function Name | Purpose | Triggered By |
| :--- | :--- | :--- |
| `handle_new_user` | Creates `users_public` profile on signup. | `auth.users` (Trigger) |
| `process_featured_queue` | Rotates featured slots and handles expiry. | Cron Job (Nightly) |
| `check_product_limit` | Calculates product count vs tier. | Trigger mentioned above |

## 3. Scheduled Automations (Cron)
| Name | Schedule | Action |
| :--- | :--- | :--- |
| `active_featured_rotation` | `0 0 * * *` (Midnight) | Calls `process_featured_queue` to expire old slots and activate waiting ones. |
