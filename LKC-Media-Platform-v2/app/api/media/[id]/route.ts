import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authorizedMedia, imageResponse } from "@/lib/media";
import { fail, uuid } from "@/lib/security";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Image unavailable.", 404);
    const size = new URL(request.url).searchParams.get("size");
    if (await isAdminAuthenticated()) {
      const { data: m } = await getSupabaseAdmin()
        .from("media_assets")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!m) return fail("Image unavailable.", 404);
      if (size === "original")
        return imageResponse(m.original_bucket, m.storage_path, m.file_name);
      return m.preview_path
        ? imageResponse(
            "lkc-previews",
            size === "thumb" ? m.thumbnail_path : m.preview_path,
          )
        : imageResponse(m.original_bucket, m.storage_path);
    }
    const result = await authorizedMedia(id);
    if (!result)
      return fail("Image unavailable. Reopen your gallery to sign in.", 404);
    const { media: m, album } = result;
    if (!m.preview_path || size === "original")
      return fail("Image unavailable.", 404);
    const path = album.is_private
      ? m.client_preview_path
      : size === "thumb"
        ? m.thumbnail_path
        : m.preview_path;
    if (!path) return fail("Image unavailable.", 404);
    return await imageResponse("lkc-previews", path);
  } catch {
    return fail("Image temporarily unavailable.", 503);
  }
}
