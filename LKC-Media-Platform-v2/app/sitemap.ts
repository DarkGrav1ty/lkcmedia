import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type AlbumRow = {
    slug: string;
    event_date: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const pages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${SITE_URL}/gallery`,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/terms`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/privacy`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/cancellation-rescheduling`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${SITE_URL}/photo-usage`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
    ];

    const db = getSupabaseAdmin();

    for (let offset = 0; ; offset += 500) {
        const { data, error } = await db
            .from("public_album_cards")
            .select("slug,event_date")
            .order("id")
            .range(offset, offset + 499);

        if (error) {
            throw new Error("Sitemap unavailable");
        }

        const albums = (data || []) as AlbumRow[];

        pages.push(
            ...albums.map((album) => ({
                url: `${SITE_URL}/gallery/${album.slug}`,
                lastModified: album.event_date || undefined,
                changeFrequency: "monthly" as const,
                priority: 0.8,
            })),
        );

        if (albums.length < 500) {
            break;
        }
    }

    return pages;
}
