import GalleryBrowser from "@/components/GalleryBrowser";
import Pagination from "@/components/Pagination";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "Sports & Portrait Photography Galleries",
  "/gallery",
  "Explore sports and portrait photography galleries from LKC Media in Arizona.",
);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
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

  let albums: any[] = [];
  let total = 0;
  let failed = false;

  try {
    const {
      data,
      error,
      count,
    } = await getSupabaseAdmin()
      .from("public_album_cards")
      .select(
        "id,name,slug,gallery,event_date,photo_count,cover_id,sports",
        {
          count: "exact",
        },
      )
      .order("sort_order")
      .order("id")
      .range(
        (page - 1) * 48,
        page * 48 - 1,
      );

    if (error) {
      throw error;
    }

    albums = (data || []).map(
      (album) => ({
        ...album,

        cover_url:
          album.cover_id
            ? `/media/${album.cover_id}?size=thumb`
            : null,

        sports:
          album.sports || [],
      }),
    );

    total = count || 0;
  } catch {
    failed = true;
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">
        LKC Media
      </p>

      <h1>Galleries</h1>

      <p className="mt-4 text-slate-300">
        Sports and portrait photography
        from LKC Media in Arizona.
      </p>

      {failed ? (
        <div
          className="panel"
          role="status"
        >
          Galleries are temporarily
          unavailable. Please try again
          shortly.
        </div>
      ) : (
        <>
          <GalleryBrowser
            albums={albums}
          />

          <Pagination
            page={page}
            total={total}
            path="/gallery"
          />
        </>
      )}
    </main>
  );
}