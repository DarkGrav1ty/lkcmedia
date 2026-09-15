import Link from "next/link";
import { notFound } from "next/navigation";
import GalleryLightbox, {
    GalleryPhoto,
} from "@/components/GalleryLightbox";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Album = {
    id: string;
    name: string;
    slug: string;
    gallery: "sports" | "portraits";
    event_date: string | null;
};

type MediaAsset = {
    id: string;
    file_name: string;
    public_url: string;
    sort_order: number;
    created_at: string;
};

export const dynamic = "force-dynamic";

function formatDate(
    date: string | null
) {
    if (!date) {
        return null;
    }

    const parsed = new Date(
        `${date}T12:00:00`
    );

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric",
        }
    ).format(parsed);
}

export default async function AlbumPage({
    params,
}: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;

    const db = getSupabaseAdmin();

    const {
        data: albumData,
        error: albumError,
    } = await db
        .from("albums")
        .select(
            "id, name, slug, gallery, event_date"
        )
        .eq("slug", slug)
        .eq("is_visible", true)
        .maybeSingle();

    if (albumError) {
        console.error(
            "Could not load album:",
            albumError.message
        );
    }

    if (!albumData) {
        notFound();
    }

    const album = albumData as Album;

    const {
        data: mediaData,
        error: mediaError,
    } = await db
        .from("media_assets")
        .select(
            "id, file_name, public_url, sort_order, created_at"
        )
        .eq("album_id", album.id)
        .eq("is_visible", true)
        .order("sort_order", {
            ascending: true,
        })
        .order("created_at", {
            ascending: false,
        });

    if (mediaError) {
        console.error(
            "Could not load album photos:",
            mediaError.message
        );
    }

    const media =
        (mediaData || []) as MediaAsset[];

    const photos: GalleryPhoto[] =
        media.map((photo) => ({
            id: photo.id,
            preview: photo.public_url,
            title: photo.file_name.replace(
                /\.[^/.]+$/,
                ""
            ),
        }));

    const eventDate = formatDate(
        album.event_date
    );

    return (
        <main className="min-h-screen px-5 pb-24 pt-32 md:px-10">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/gallery"
                    className="text-sm font-bold text-white/40 transition hover:text-white"
                >
                    ← All Galleries
                </Link>

                <div className="mt-10 border-b border-white/10 pb-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                            {album.gallery}
                        </p>

                        {eventDate && (
                            <>
                                <span className="text-white/20">
                                    •
                                </span>

                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                                    {eventDate}
                                </p>
                            </>
                        )}
                    </div>

                    <h1 className="mt-4 max-w-5xl text-4xl font-black uppercase tracking-[-0.04em] md:text-7xl">
                        {album.name}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                        <p className="text-sm text-white/45">
                            {photos.length}{" "}
                            {photos.length === 1
                                ? "photo"
                                : "photos"}
                        </p>

                        <span className="text-white/20">
                            •
                        </span>

                        <p className="text-sm text-white/35">
                            Click any image to view
                            full screen.
                        </p>
                    </div>
                </div>

                <div className="mt-10">
                    <GalleryLightbox
                        photos={photos}
                    />
                </div>
            </div>
        </main>
    );
}