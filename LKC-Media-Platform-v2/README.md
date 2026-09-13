# LKC Media Platform v2

Fresh Next.js 16 + Tailwind CSS 4 build for LKC Media.

## Run locally

1. Install Node.js 20+.
2. Open PowerShell in this folder.
3. Run:

```powershell
npm install
npm run dev
```

4. Open http://localhost:3000

The demo UI works without Supabase or Stripe. Buying a demo photo intentionally returns a setup message.

## Tailwind

This project is already configured for Tailwind CSS 4:

- `@tailwindcss/postcss` is installed.
- `postcss.config.mjs` uses `@tailwindcss/postcss`.
- `app/globals.css` starts with `@import "tailwindcss";`.

## Supabase

Copy `.env.example` to `.env.local` and add your keys.

Create:
- `lkc-previews` as a PUBLIC bucket.
- `lkc-originals` as a PRIVATE bucket.

Run `supabase/migrations/001_initial.sql` in Supabase SQL Editor.

## Stripe

Add Stripe environment variables only when ready to enable purchases.

The checkout route always reads the authoritative photo price from the database.
The secure download route verifies a token, expiration, download count, and paid order before generating a short-lived signed URL for the private original.

## Admin

`/admin` is a UI shell in this revision. Do NOT deploy it as a real admin portal until Supabase Auth and authorization middleware are connected.

## Images

The included demo images are placeholders generated from available project imagery where possible. Replace anything in `public/images/` with your preferred LKC photos while keeping the filenames, or update the component paths.
