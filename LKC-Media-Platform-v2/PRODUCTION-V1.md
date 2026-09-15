# LKC Media production v1

## Required cutover order

1. Back up the Supabase database and the existing `lkc-media` storage bucket.
2. Apply `supabase/migrations/001_initial.sql`, `002_cms.sql`, and `003_production_v1.sql` in order. Existing installations normally need only `003_production_v1.sql` after confirming the first two are already present.
3. Set server-only `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and `RESEND_API_KEY`. Use a unique random `SESSION_SECRET` of at least 32 characters and an `ADMIN_PASSWORD` of at least 16 characters. Keep these values out of client variables and source control.
4. Deploy the application. Purge cached legacy Supabase public object URLs because migration 003 makes all original and preview buckets private.
5. Sign in at `/admin`. Open each legacy photo and select **Prepare previews**. This reads the retained original and creates a clean client preview plus watermarked public thumbnail and preview.
6. Confirm each album's privacy, PIN, expiration, visibility, and URL before publishing it. Changing access settings revokes existing client sessions.
7. Submit a test booking. Confirm it appears in Admin even if either email fails, and review the two email-delivery indicators.

## Storage model

- `lkc-originals` stores new original files unchanged and privately.
- `lkc-previews` stores private clean previews and public watermarked derivatives. The bucket itself remains private; application routes enforce access.
- Existing bytes in `lkc-media` are retained and the bucket becomes private. Removing a photo in Admin unpublishes and unassigns it while retaining its original for recovery.

## Release checks

Run `npm ci`, `npx tsc --noEmit`, and `npm run build:vinext`. The build may report missing Cloudflare bindings during local prerendering; production `wrangler.jsonc` already declares `VINEXT_KV_CACHE` and `IMAGES`.

Online checkout stays closed because this repository does not contain a verified Stripe fulfillment webhook. This prevents payment for an order the application cannot deliver automatically.
