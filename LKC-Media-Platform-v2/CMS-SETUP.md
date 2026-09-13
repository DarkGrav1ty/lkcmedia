# LKC Media CMS Setup

## 1. Run the CMS migration
In Supabase -> SQL Editor, open `supabase/migrations/002_cms.sql`, paste the full file, and click Run.

This creates:
- `site_settings`
- `page_sections`
- `media_assets`
- public Storage bucket `lkc-media`
- required `service_role` table grants

## 2. Add the admin password
Add this to `.env.local` (do not commit this file):

```env
ADMIN_PASSWORD=choose-a-strong-private-password
```

Keep your existing Supabase variables exactly as they are.

## 3. Install and run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/admin`. You will be redirected to `/admin/login`.

## CMS features in this revision
- Password-protected admin session using an HttpOnly signed cookie
- Dashboard metrics and quick actions
- Booking status updates: new/contacted/confirmed/completed/cancelled
- Media Library image uploads to Supabase Storage
- Website settings editor
- Add/remove/reorder/show/hide homepage content sections
- Text/CTA section editing
- Uploaded image URLs can be attached to content sections
- Public homepage renders saved CMS sections

## Important
The `lkc-media` bucket is public because it is for website-display images. Do not use it for paid/private full-resolution customer originals. The existing `lkc-originals` design remains the correct direction for protected purchased files.
