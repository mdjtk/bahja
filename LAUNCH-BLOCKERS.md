# Launch Blockers — Bahja Honey

## 🔴 Must Fix (site won't work without these)

### 1. Razorpay payments are broken
- **File:** `app/checkout/page.tsx:102`
- **Problem:** `fetch('/api/create-order', ...)` uses plain `fetch` instead of `fetchWithAuth`. The endpoint requires `Authorization: Bearer <token>`. Returns 401 → user sees error.
- **Fix:** Change to `fetchWithAuth('/api/create-order', ...)`. Import from `@/lib/fetch-with-auth`.

### 2. Razorpay order amount is client-controlled (payment bypass)
- **File:** `app/api/create-order/route.ts:26`
- **Problem:** `amount` comes from the client. Attacker can pay ₹1 and submit the payment ID against a ₹1000 order.
- **Fix:** Reconstruct amount server-side from cart items + DB prices (same pattern as `/api/orders/route.ts:28-46`). Require the cart to be sent in the request body.

### 3. Razorpay payment ID not validated against actual amount paid
- **File:** `app/api/orders/route.ts:74`
- **Problem:** `razorpay_payment_id` is stored without verifying the payment amount via Razorpay API. A ₹1 payment can be applied to a ₹500 order.
- **Fix:** After receiving `razorpay_payment_id`, call `razorpay.payments.fetch(paymentId)` and verify `amount === orderTotal * 100`.

### 4. FAQ page crashes the build
- **File:** `app/faq/page.tsx`
- **Problem:** `TypeError: sanitize is not a function` — DOMPurify import issue.
- **Fix:** Check how DOMPurify is imported and initialized. Typically: `import DOMPurify from 'dompurify'` then `DOMPurify.sanitize(html)`.

### 5. WhatsApp OTP is dead
- **File:** `.env.local` lines 29-30
- **Problem:** `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are empty. Phone OTP flow never delivers.
- **Fix:** Either (a) populate real WhatsApp Cloud API credentials, or (b) replace with SMS OTP via a provider like Twilio/MSG91, or (c) disable phone OTP UI and use email-only auth.

### 6. Stock overselling under concurrent load
- **File:** `lib/inventory.ts`
- **Problem:** `checkStock()` and `deductStock()` are separate calls with no transaction. Two simultaneous requests for the last unit both pass stock check, both place orders, but only one deduction runs.
- **Fix:** Replace with a single atomic Supabase RPC that checks + decrements in one call using `SELECT ... FOR UPDATE` or a plpgsql function with `stock >= p_qty` guard.

---

## 🟠 High Priority (security / trust risks)

### 7. Supabase service_role key used everywhere (no RLS)
- **File:** `lib/supabase.ts`
- **Problem:** Every API route uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses all Row Level Security. Any auth bug exposes the full database.
- **Fix:** Create a separate Supabase client using the anon key + user's Firebase JWT for user-facing routes. Restrict service_role to admin-only endpoints.

### 8. No middleware protecting admin routes
- **Problem:** Admin page (`/admin`) checks auth client-side after mount. If JS is off or a cached cookie is present, the admin UI is accessible.
- **Fix:** Create `middleware.ts` that checks `bahja_admin` cookie for all `/admin/*` routes (except `/admin/login`).

### 9. Weak default admin password
- **File:** `supabase/migration.sql:24` + `.env.local:16`
- **Problem:** `Bahja2025` is a dictionary word + year. Rate limiter is per-instance (ineffective on Vercel).
- **Fix:** Change to a 20+ random character password. Add Upstash Redis rate limiting or Vercel Edge rate limiting for admin login (replace `lib/rate-limit.ts`).

### 10. No security headers
- **File:** `next.config.ts`
- **Problem:** No CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- **Fix:** Add `headers()` async function to `next.config.ts` with CSP, HSTS (max-age=63072000), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy.

### 11. OTP verification has no rate limiting
- **File:** `app/api/auth/verify-whatsapp-otp/route.ts`
- **Problem:** Any 6-digit OTP can be brute-forced with unlimited attempts.
- **Fix:** Add attempt counter in Supabase (`bahja_otps.attempts`), lock after 5 failures for 15 minutes.

---

## 🟡 Should Fix Before Launch

### 12. Duplicate lib modules
- **Files:** `lib/cart.ts`, `lib/orders.ts`, `lib/phone.ts` — all three duplicate functions in `lib/store.ts`.
- **Fix:** Delete all three. Update any imports to point to `@/lib/store`.

### 13. Contact page has broken phone link
- **File:** `app/admin/page.tsx:579` — `<a href={`tel:${c.email}`}>Call</a>` uses email as phone number.
- **Fix:** Change to use the contact's phone field (which doesn't exist in the schema) or remove the button.

### 14. Predictable order IDs
- **File:** `lib/store.ts:115` and `lib/orders.ts:53`
- **Fix:** Replace `Date.now().toString(36)` with `crypto.randomUUID()`.

### 15. Order input fields not sanitized server-side
- **File:** `app/api/orders/route.ts:63-71`
- **Fix:** Add max-length validation, regex patterns for phone/pincode on the server before INSERT.

### 16. Cart sync accepts unvalidated product IDs
- **File:** `app/api/cart/sync/route.ts:32-39`
- **Fix:** Verify each `product_id` + `variant` exists in `bahja_products` before inserting.

### 17. `/api/verify-payment` is unauthenticated
- **File:** `app/api/verify-payment/route.ts`
- **Fix:** Add `verifyAuth(req)` check. This endpoint verifies Razorpay signatures — it should not be a public oracle.

---

## 🟢 Should Fix Soon (post-launch)

- Replace `lib/rate-limit.ts` in-memory Map with Upstash Redis.
- Add stock level indicators on product pages.
- Add product filtering/search on shop page.
- Enable guest checkout (allow order without Firebase account).
- Add product image optimization (use Next `<Image>` with width/height).
- Add preconnect links for fonts and Razorpay CDN in `<head>`.
- Add canonical URLs to all pages.
- Replace admin inline SVG icons with lucide-react.
- Move `AdminProducts.tsx` into `app/admin/components/`.
