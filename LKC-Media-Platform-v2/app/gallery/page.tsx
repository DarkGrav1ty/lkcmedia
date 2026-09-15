import GalleryBrowser, {
    PublicAlbum,
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
        .order("event_date", {
            ascending: false,
        })
        .order("created_at", {
            ascending: false,
        });

    if (albumError) {
        console.error(
            "Could not load public albums:",
            albumError.message
        );
    }

    const albums =
        (albumData || []) as AlbumRow[];

    const albumIds = albums.map(
        (album) => album.id
    );

    let media: MediaRow[] = [];

    if (albumIds.length > 0) {
        const {
            data: mediaData,
            error: mediaError,
        } = await db
            .from("media_assets")
            .select(
                "id, album_id, public_url, sort_order, created_at"
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
                "Could not load gallery covers:",
                mediaError.message
            );
        }

        media =
            (mediaData || []) as MediaRow[];
    }

    const publicAlbums: PublicAlbum[] =
        albums.map((album) => {
            const albumMedia = media.filter(
                (photo) =>
                    photo.album_id === album.id
            );

            return {
                id: album.id,
                name: album.name,
                slug: album.slug,
                gallery: album.gallery,
                event_date: album.event_date,
                cover_url:
                    albumMedia[0]?.public_url ||
                    null,
                photo_count:
                    albumMedia.length,
            };
        });

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
                            Sports and portrait
                            photography from recent
                            LKC Media sessions.
                        </p>
                    </div>

                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/25">
                        {publicAlbums.length}{" "}
                        {publicAlbums.length === 1
                            ? "Gallery"
                            : "Galleries"}
                    </p>
                </div>

                <GalleryBrowser
                    albums={publicAlbums}
                />
            </div>
        </main>
    );
}