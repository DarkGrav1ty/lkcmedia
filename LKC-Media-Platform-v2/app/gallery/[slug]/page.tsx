import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { activeAlbum } from "@/lib/client-auth";
import { albumFields } from "@/lib/media";
import { pageMetadata } from "@/lib/site";
import AlbumPhotos from "@/components/AlbumPhotos";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};
export const dynamic = "force-dynamic";
async function read(slug: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("albums")
    .select(albumFields)
    .eq("slug", slug)
    .eq("is_private", false)
    .maybeSingle();
  if (error) throw error;
  return data && activeAlbum(data) ? data : null;
}
export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const a = await read(slug);
    return a
      ? pageMetadata(a.name, `/gallery/${slug}`)
      : {
          title: "Gallery unavailable",
          robots: { index: false, follow: false },
        };
  } catch {
    return { title: "Gallery unavailable", robots: { index: false } };
  }
}
export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const a = await read(slug);
  if (!a) notFound();
  const q = await searchParams;
  const page = Math.max(1, Math.min(10000, Math.floor(Number(q.page) || 1)));
  return (
    <main className="page-shell">
      <Link href="/gallery">← All galleries</Link>
      <p className="eyebrow mt-8">{a.gallery}</p>
      <h1>{a.name}</h1>
      {a.event_date && <p className="mt-4 text-slate-300">{a.event_date}</p>}
      <AlbumPhotos id={a.id} page={page} path={`/gallery/${slug}`} />
    </main>
  );
}
