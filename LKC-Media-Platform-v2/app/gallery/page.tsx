import GalleryBrowser, {
    type PublicAlbum,
} from "@/components/GalleryBrowser";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type AlbumRow = {
    id: string;
    name: string;
    slug: string;
    gallery: "sports" | "portraits";
    event_date: string | null;
    sort_order: number;
    created_at: string;
};

type MediaRow = {
    id: string;
    album_id: string | null;
    public_url: string;
    sport: string | null;
    sort_order: number;
    created_at: string;
};

export const dynamic = "force-dynamic";

export default async function GalleriesPage() {
    const db = getSupabaseAdmin();

    const {
        data: albumData,
        error: albumError,
    } = await db
        .from("albums")
        .select(
            "id, name, slug, gallery, event_date, sort_order, created_at"
        )
        .eq("is_visible", true)
        .order("sort_order", {
            ascending: true,
        })
        .order("created_at", {
            ascending: false,
        });

    if (albumError) {
        console.error(
            "Gallery album query failed:",
            albumError.message
        );

        return (
            <main className="min-h-screen px-5 pb-24 pt-32 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                        LKC Media
                    </p>

                    <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.05em] md:text-7xl">
                        Galleries
                    </h1>

                    <div className="mt-12 rounded-2xl border border-white/10 bg-[#0d1118] p-8">
                        <p className="font-black">
                            Galleries are temporarily unavailable.
                        </p>

                        <p className="mt-2 text-sm text-white/45">
                            Please check back shortly.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const albums =
        (albumData || []) as AlbumRow[];

    if (albums.length === 0) {
        return (
            <main className="min-h-screen px-5 pb-24 pt-32 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                        LKC Media
                    </p>

                    <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.05em] md:text-7xl">
                        Galleries
                    </h1>

                    <div className="mt-12 rounded-2xl border border-white/10 bg-[#0d1118] px-6 py-20 text-center">
                        <p className="text-white/45">
                            No galleries are published yet.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const albumIds = albums.map(
        (album) => album.id
    );

    const {
        data: mediaData,
        error: mediaError,
    } = await db
        .from("media_assets")
        .select(
            "id, album_id, public_url, sport, sort_order, created_at"
        )
        .in("album_id", albumIds)
        .eq("is_visible", true)
        .order("sort_order", {
            ascending: true,
        })
        .order("created_at", {
            ascending: false,
        });

    if (mediaError) {
        console.error(
            "Gallery media query failed:",
            mediaError.message
        );
    }

    const media =
        mediaError
            ? []
            : ((mediaData || []) as MediaRow[]);

    const publicAlbums: PublicAlbum[] =
        albums
            .map((album) => {
                const albumMedia =
                    media.filter(
                        (photo) =>
                            photo.album_id ===
                            album.id
                    );

                const sports = Array.from(
                    new Set(
                        albumMedia
                            .map((photo) =>
                                photo.sport?.trim()
                            )
                            .filter(
                                (
                                    sport
                                ): sport is string =>
                                    Boolean(sport)
                            )
                    )
                ).sort((a, b) =>
                    a.localeCompare(b)
                );

                return {
                    id: album.id,
                    name: album.name,
                    slug: album.slug,
                    gallery:
                        album.gallery,
                    event_date:
                        album.event_date,
                    cover_url:
                        albumMedia[0]
                            ?.public_url ??
                        null,
                    photo_count:
                        albumMedia.length,
                    sports,
                };
            })
            .filter(
                (album) =>
                    album.photo_count > 0
            );

    return (
        <main className="min-h-screen px-5 pb-24 pt-32 md:px-10">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                    LKC Media
                </p>

                <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-[-0.05em] md:text-7xl">
                            Galleries
                        </h1>

                        <p className="mt-4 max-w-xl leading-7 text-white/45">
                            Browse sports and portrait
                            photography from LKC Media.
                        </p>
                    </div>

                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/25">
                        {publicAlbums.length}{" "}
                        {publicAlbums.length === 1
                            ? "Gallery"
                            : "Galleries"}
                    </p>
                </div>

                {publicAlbums.length > 0 ? (
                    <GalleryBrowser
                        albums={publicAlbums}
                    />
                ) : (
                    <div className="mt-12 rounded-2xl border border-white/10 bg-[#0d1118] px-6 py-20 text-center">
                        <p className="font-bold text-white/60">
                            No galleries have photos published yet.
                        </p>

                        <p className="mt-2 text-sm text-white/35">
                            Add visible photos to a group in the Media Library.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}