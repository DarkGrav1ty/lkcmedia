import { notFound } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
    activeAlbum,
    canViewAlbum,
} from "@/lib/client-auth";
import { albumFields } from "@/lib/media";

import ClientUnlock from "@/components/ClientUnlock";
import AlbumPhotos from "@/components/AlbumPhotos";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Client gallery | LKC Media",

    robots: {
        index: false,
        follow: false,
    },

    referrer: "no-referrer" as const,
};

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{
        slug: string;
    }>;

    searchParams: Promise<{
        page?: string;
    }>;
}) {
    const { slug } = await params;

    const { data: album, error } =
        await getSupabaseAdmin()
            .from("albums")
            .select(albumFields)
            .eq("slug", slug)
            .eq("is_private", true)
            .maybeSingle();

    if (error) {
        throw error;
    }

    if (!album || !activeAlbum(album)) {
        notFound();
    }

    if (!(await canViewAlbum(album))) {
        return (
            <main className="page-shell text-center">
                <p className="eyebrow">
                    Private client gallery
                </p>

                <h1>
                    {album.name}
                </h1>

                <p className="mt-4 text-slate-300">
                    Enter the PIN shared with you
                    to access your gallery and
                    authorized downloads.
                </p>

                <ClientUnlock
                    slug={slug}
                />
            </main>
        );
    }

    const query = await searchParams;

    const page = Math.max(
        1,
        Math.min(
            10000,
            Math.floor(
                Number(query.page) || 1,
            ),
        ),
    );

    return (
        <main className="page-shell">
            <p className="eyebrow">
                Your client gallery
            </p>

            <h1>
                {album.name}
            </h1>

            {album.expires_at && (
                <p className="mt-4 text-slate-300">
                    Available until{" "}
                    {new Date(
                        album.expires_at,
                    )
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}{" "}
                    UTC.
                </p>
            )}

            <AlbumPhotos
                id={album.id}
                page={page}
                path={`/client/${slug}`}
                privateGallery
            />
        </main>
    );
}