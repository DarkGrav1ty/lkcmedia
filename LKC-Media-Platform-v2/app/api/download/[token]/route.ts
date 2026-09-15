import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { imageResponse } from "@/lib/media";
import { fail, uuid } from "@/lib/security";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!uuid(token)) return fail("Invalid download link.", 404);
    const { data, error } = await getSupabaseAdmin().rpc(
      "claim_paid_download",
      { download_token: token },
    );
    if (error) throw error;
    if (!data)
      return fail("Download unavailable, expired, or limit reached.", 403);
    return await imageResponse("lkc-originals", data, "LKC-Media-photo.jpg");
  } catch {
    return fail("Download temporarily unavailable.", 503);
  }
}
