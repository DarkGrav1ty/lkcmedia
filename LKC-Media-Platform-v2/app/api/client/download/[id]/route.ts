import { authorizedMedia, imageResponse } from "@/lib/media";
import { fail, uuid } from "@/lib/security";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Download unavailable.", 404);
    const result = await authorizedMedia(id);
    if (!result || !result.album.is_private)
      return fail(
        "Your access expired or this download is unavailable. Reopen your client gallery.",
        403,
      );
    return await imageResponse(
      result.media.original_bucket,
      result.media.storage_path,
      result.media.file_name,
    );
  } catch {
    return fail("Download temporarily unavailable. Try again shortly.", 503);
  }
}
