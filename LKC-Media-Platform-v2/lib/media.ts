import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import { canViewAlbum } from "./client-auth";
export const albumFields =
  "id,name,slug,gallery,event_date,is_visible,is_private,expires_at,auth_version,sort_order,created_at";
export const mediaFields =
  "id,file_name,album_id,gallery,sport,is_featured,is_visible,sort_order,width,height,alt_text,preview_path,created_at";
export function mediaDTO(row: any) {
  const { preview_path, ...rest } = row;
  return {
    ...rest,
    ready: !!preview_path,
    public_url: `/api/media/${row.id}?size=thumb`,
  };
}
export async function authorizedMedia(id: string) {
  const db = getSupabaseAdmin();
  const { data: media, error } = await db
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!media || !media.is_visible || !media.album_id) return null;
  const { data: album, error: ae } = await db
    .from("albums")
    .select(albumFields)
    .eq("id", media.album_id)
    .maybeSingle();
  if (ae) throw ae;
  if (!album || !(await canViewAlbum(album))) return null;
  return { media, album };
}
export async function imageResponse(
  bucket: string,
  path: string,
  filename?: string,
) {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .download(path);
  if (error || !data) throw new Error("Image unavailable");
  const headers: Record<string, string> = {
    "Content-Type": data.type || "image/jpeg",
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
    "Referrer-Policy": "no-referrer",
  };
  if (filename)
    headers["Content-Disposition"] =
      `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}"`;
  return new Response(data, { headers });
}
