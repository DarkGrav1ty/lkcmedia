import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail, uuid } from "@/lib/security";

export const dynamic = "force-dynamic";

function safeFileName(value: string) {
  const clean = value
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${clean || "lkc-media-photo"}.jpg`;
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    if (!uuid(id)) {
      return fail("Image unavailable.", 404);
    }

    const db = getSupabaseAdmin();

    const {
      data: media,
      error: mediaError,
    } = await db
      .from("media_assets")
      .select(
        "id,file_name,album_id,is_visible,preview_path,thumbnail_path",
      )
      .eq("id", id)
      .eq("is_visible", true)
      .maybeSingle();

    if (
      mediaError ||
      !media ||
      !media.album_id ||
      !media.preview_path
    ) {
      return fail("Image unavailable.", 404);
    }

    const {
      data: album,
      error: albumError,
    } = await db
      .from("albums")
      .select(
        "id,is_visible,is_private,expires_at",
      )
      .eq("id", media.album_id)
      .eq("is_visible", true)
      .eq("is_private", false)
      .maybeSingle();

    if (albumError || !album) {
      return fail("Image unavailable.", 404);
    }

    if (
      album.expires_at &&
      new Date(album.expires_at).getTime() <=
        Date.now()
    ) {
      return fail("Image unavailable.", 404);
    }

    const size = new URL(
      request.url,
    ).searchParams.get("size");

    const path =
      size === "thumb" &&
      media.thumbnail_path
        ? media.thumbnail_path
        : media.preview_path;

    const {
      data,
      error,
    } = await db.storage
      .from("lkc-previews")
      .download(path);

    if (error || !data) {
      return fail("Image unavailable.", 404);
    }

    const filename = safeFileName(
      media.file_name,
    );

    return new Response(data, {
      status: 200,

      headers: {
        "Content-Type":
          data.type || "image/jpeg",

        "Content-Disposition":
          `inline; filename="${filename}"`,

        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",

        "X-Content-Type-Options":
          "nosniff",

        "Content-Language":
          "en",

        "Access-Control-Allow-Origin":
          "*",
      },
    });
  } catch {
    return fail(
      "Image temporarily unavailable.",
      503,
    );
  }
}