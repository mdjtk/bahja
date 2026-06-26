# Bahja Store — Full Supabase Migration Plan

## Goal
Move all hardcoded data (products) into Supabase, wire everything together (cart sync, login UX, admin control), and fix existing bugs.

---

## Phase 1 — Fix Current Issues

### 1a. Refresh Supabase schema cache
- Run `NOTIFY pgrst, 'reload schema'` so `bahja_orders` queries stop 500-ing.

### 1b. Fix account page
- Show phone number when no name exists (phone OTP users have no `full_name`).
- Add inline "Edit Name" button → saves to `user_metadata` via `supabase.auth.updateUser()`.

### 1c. Improve OTP login
- Add "Resend OTP" button with 30s cooldown after sending.
- On successful verify/login, **sync local cart to Supabase** via `POST /api/cart/sync`.

### 1d. Cart sync on Google OAuth
- In `app/auth/callback/route.ts`, sync local cart to Supabase after session exchange.

---

## Phase 2 — Products Database

### 2a. Create `bahja_products` table
| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | e.g. `"wild-honey"` |
| `name` | `text` | |
| `type` | `text` | |
| `slug` | `text` | |
| `image` | `text` | |
| `rating` | `numeric` | |
| `description` | `text` | |
| `variant_order` | `text[]` | `{"250g","500g"}` |
| `variants` | `jsonb` | `{"250g":{"label":"250g","price":349},...}` |
| `active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | auto |
| `updated_at` | `timestamptz` | auto |

### 2b. Seed existing 2 products

---

## Phase 3 — Products API

### 3a. `GET /api/products` — list active products (public)
### 3b. `POST /api/products` — create product (admin, `bahja_admin` cookie)
### 3c. `PUT /api/products/[id]` — update product (admin)
### 3d. `DELETE /api/products/[id]` — soft-delete (set `active=false`) (admin)

---

## Phase 4 — Frontend Migration

### 4a. Shop page
- Replace `import { PRODUCTS }` with `fetch('/api/products')`.

### 4b. Checkout page
- Replace product price lookup from hardcoded `PRODUCTS` with lookup from API response.

### 4c. Remove dependency on `lib/data.ts`
- Keep only `Product`/`ProductVariant` type definitions for TypeScript.

---

## Phase 5 — Admin Product Management

### 5a. Add "Products" tab to admin panel
- Product list: image thumbnail, name, type, price range, active toggle.
- Edit modal: name, description, variants (label + price), image URL.
- Delete = set `active = false`.

### 5b. Admin auth check for product APIs
- Reuse same `bahja_admin` cookie verification pattern.

---

## Files Changed Summary

| File | Action |
|---|---|
| `app/auth/login/page.tsx` | Edit — resend OTP + cart sync |
| `app/auth/callback/route.ts` | Edit — cart sync |
| `app/account/page.tsx` | Edit — show phone, edit name |
| `app/shop/page.tsx` | Edit — fetch from API |
| `app/checkout/page.tsx` | Edit — fetch from API |
| `app/admin/page.tsx` | Edit — add Products tab |
| `app/api/products/route.ts` | **New** |
| `app/api/products/[id]/route.ts` | **New** |
| `lib/data.ts` | Strip to types only |
| SQL migration | Create + seed `bahja_products` |
