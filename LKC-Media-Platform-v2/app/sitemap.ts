import { SITE_URL } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const pages = [
    "",
    "/gallery",
    "/terms",
    "/privacy",
    "/cancellation-rescheduling",
    "/photo-usage",
  ].map((p) => ({ url: SITE_URL + p }));
  const db = getSupabaseAdmin();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db
      .from("public_album_cards")
      .select("slug")
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("Sitemap unavailable");
    pages.push(
      ...(data || []).map((a) => ({ url: `${SITE_URL}/gallery/${a.slug}` })),
    );
    if (!data || data.length < 500) break;
  }
  return pages;
}
