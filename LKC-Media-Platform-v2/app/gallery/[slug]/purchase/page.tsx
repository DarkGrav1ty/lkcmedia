
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { activeAlbum } from "@/lib/client-auth";
import { albumFields } from "@/lib/media";
import PhotoStorefront from "@/components/PhotoStorefront";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Purchase Photos | LKC Media",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PurchasePage({
  params,
}: Props) {
  const { slug } = await params;

  const { data: album, error: albumError } =
    await getSupabaseAdmin()
      .from("albums")
      .select(albumFields)
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();

  if (albumError) {
    throw new Error("Gallery unavailable");
  }

  if (!album || !activeAlbum(album)) {
    notFound();
  }

  const photos: {
    id: string;
    file_name: string;
    alt_text: string | null;
    width: number | null;
    height: number | null;
  }[] = [];

  // Supabase returns a limited number of rows per request.
  // Load every photo so large Lightroom events remain purchasable.
  const batchSize = 500;

  for (let offset = 0; ; offset += batchSize) {
    const { data, error } = await getSupabaseAdmin()
      .from("media_assets")
      .select("id,file_name,alt_text,width,height")
      .eq("album_id", album.id)
      .eq("is_visible", true)
      .not("preview_path", "is", null)
      .order("sort_order")
      .order("id")
      .range(offset, offset + batchSize - 1);

    if (error) {
      throw new Error("Gallery photos unavailable");
    }

    photos.push(...(data || []));

    if (!data || data.length < batchSize) {
      break;
    }
  }

  return (
    <main className="page-shell">
      <nav aria-label="Breadcrumb">
        <Link href={`/gallery/${slug}`}>
          &larr; Back to gallery
        </Link>
      </nav>

      <header className="mt-8">
        <p className="eyebrow">
          LKC MEDIA ┬╖ PHOTO ORDERS
        </p>

        <h1 className="mt-3">
          Purchase Photos
        </h1>

        <p className="mt-3 text-xl text-slate-300">
          {album.name}
        </p>

        <p className="mt-4 max-w-3xl text-slate-400">
          Select the photos you want. Your total updates
          automatically as you make your selection.
        </p>
      </header>

      <PhotoStorefront
        albumId={album.id}
        photos={photos.map((photo) => ({
          id: photo.id,
          title: photo.alt_text || photo.file_name,
          width: photo.width,
          height: photo.height,
        }))}
      />
    </main>
  );
}
