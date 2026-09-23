# LKC Media Photo Storefront Setup

1. Run `supabase/migrations/006_photo_orders.sql` in the Supabase SQL editor.
2. Run `npm run build:vinext`.
3. Run `npx vinext start` and test locally.
4. In Admin > Events, create a public gallery from a Lightroom share.
5. Open the public gallery, select photos, and submit a test order.
6. In Admin > Orders, click **MARK PAID + DELIVER**.
7. Verify the private client gallery contains only the purchased photos and that downloads work.

Payment methods in this build are Cash, Apple Cash, and Zelle. Payment confirmation is manual. Stripe is not required.

Do not deploy until the local end-to-end test passes.
