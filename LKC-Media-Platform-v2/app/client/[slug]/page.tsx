import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { canViewAlbum } from "@/lib/client-auth";
import { albumFields } from "@/lib/media";
import ClientUnlock from "@/components/ClientUnlock";
import AlbumPhotos from "@/components/AlbumPhotos";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client gallery | LKC Media",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { data: a, error } = await getSupabaseAdmin()
    .from("albums")
    .select(albumFields)
    .eq("slug", slug)
    .eq("is_private", true)
    .maybeSingle();
  if (error) throw error;
  if (!a || !(await canViewAlbum(a)))
    return (
      <main className="page-shell text-center">
        <h1>Client gallery</h1>
        <p className="mt-4 text-slate-300">
          Enter the PIN shared with you. Contact LKC Media if your link has
          expired.
        </p>
        <ClientUnlock slug={slug} />
      </main>
    );
  const q = await searchParams,
    page = Math.max(1, Math.min(10000, Math.floor(Number(q.page) || 1)));
  return (
    <main className="page-shell">
      <p className="eyebrow">Your private gallery</p>
      <h1>{a.name}</h1>
      {a.expires_at && (
        <p className="mt-4">
          Available until{" "}
          {new Date(a.expires_at).toISOString().slice(0, 16).replace("T", " ")}{" "}
          UTC.
        </p>
      )}
      <AlbumPhotos
        id={a.id}
        page={page}
        path={`/client/${slug}`}
        privateGallery
      />
    </main>
  );
}
