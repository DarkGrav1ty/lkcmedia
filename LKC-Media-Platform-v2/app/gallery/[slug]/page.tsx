
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { activeAlbum } from "@/lib/client-auth";
import { albumFields } from "@/lib/media";
import { SITE_URL, pageMetadata } from "@/lib/site";
import AlbumPhotos from "@/components/AlbumPhotos";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const dynamic = "force-dynamic";

async function readAlbum(slug: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("albums")
    .select(albumFields)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();

  if (error) throw error;

  return data && activeAlbum(data) ? data : null;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const album = await readAlbum(slug);

    if (!album) {
      return {
        title: "Gallery unavailable",
        robots: { index: false, follow: false },
      };
    }

    return pageMetadata(
      album.name,
      `/gallery/${slug}`,
      `${album.name} photo gallery by LKC Media.`,
      `${SITE_URL}/images/hero.jpg`,
    );
  } catch {
    return {
      title: "Gallery unavailable",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const album = await readAlbum(slug);

  if (!album) notFound();

  const query = await searchParams;

  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(query.page) || 1)),
  );

  const { count, error } = await getSupabaseAdmin()
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("album_id", album.id)
    .eq("is_visible", true)
    .not("preview_path", "is", null);

  if (error) {
    throw new Error("Gallery photos unavailable");
  }

  const totalPages = Math.max(
    1,
    Math.ceil((count || 0) / 48),
  );

  return (
    <main className="page-shell">
      <nav aria-label="Breadcrumb">
        <Link href="/gallery">
          &larr; All galleries
        </Link>
      </nav>

      <header>
        <p className="eyebrow mt-8">
          {album.gallery === "portraits"
            ? "Portrait Photography"
            : "Sports Photography"}
        </p>

        <h1>{album.name}</h1>

        {album.event_date && (
          <time
            dateTime={album.event_date}
            className="mt-4 block text-slate-300"
          >
            {album.event_date}
          </time>
        )}

        <p className="mt-4 max-w-3xl text-slate-300">
          Browse the photos from this event.
        </p>
      </header>

      <AlbumPhotos
        id={album.id}
        page={page}
        path={`/gallery/${slug}`}
      />

      {page >= totalPages && (count || 0) > 0 && (
        <section className="my-16 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
          <p className="eyebrow">LKC MEDIA</p>

          <h2 className="mt-3 text-3xl font-bold">
            Want photos from this event?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Select the photos you want to purchase and
            have them delivered to your private gallery.
          </p>

          <Link
            href={`/gallery/${slug}/purchase`}
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-500"
          >
            Purchase Photos &rarr;
          </Link>
        </section>
      )}
    </main>
  );
}
