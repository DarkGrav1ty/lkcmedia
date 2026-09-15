import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mediaFields, mediaDTO } from "@/lib/media";
import { fail, privateHeaders, uuid } from "@/lib/security";
import { imageBytes } from "@/lib/upload";
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const page = Math.max(
      0,
      Math.min(
        10000,
        Math.floor(Number(new URL(request.url).searchParams.get("page")) || 0),
      ),
    );
    const { data, error, count } = await getSupabaseAdmin()
      .from("media_assets")
      .select(mediaFields, { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range(page * 48, page * 48 + 47);
    if (error) throw error;
    return NextResponse.json(
      { media: data.map(mediaDTO), total: count },
      { headers: privateHeaders },
    );
  } catch {
    return fail("Could not load photos.", 503);
  }
}
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  const db = getSupabaseAdmin();
  const stored: { bucket: string; path: string }[] = [];
  try {
    const form = await request.formData();
    const original = await imageBytes(form.get("file"));
    const album_id = form.get("album_id");
    if (!uuid(album_id)) return fail("Choose an album before uploading.");
    const { data: album, error: ae } = await db
      .from("albums")
      .select("id,gallery")
      .eq("id", album_id)
      .single();
    if (ae || !album) return fail("Album unavailable.");
    const id = crypto.randomUUID();
    const paths: Record<string, string> = {};
    for (const [field, bucket] of [
      ["file", "lkc-originals"],
      ["preview", "lkc-previews"],
      ["thumbnail", "lkc-previews"],
      ["client_preview", "lkc-previews"],
    ]) {
      const image =
        field === "file" ? original : await imageBytes(form.get(field), true);
      const path = `${id}/${field}.${image.type.split("/")[1]}`;
      const { error } = await db.storage
        .from(bucket)
        .upload(path, image.bytes, { contentType: image.type, upsert: false });
      if (error) throw new Error("Upload failed. Try again.");
      stored.push({ bucket, path });
      paths[field] = path;
    }
    const width = Number(form.get("width")),
      height = Number(form.get("height"));
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width > 40000 ||
      height > 40000
    )
      throw new Error("Invalid image dimensions.");
    const { data, error } = await db
      .from("media_assets")
      .insert({
        id,
        file_name: original.file.name.slice(0, 240),
        storage_path: paths.file,
        original_bucket: "lkc-originals",
        public_url: `/api/media/${id}`,
        preview_path: paths.preview,
        thumbnail_path: paths.thumbnail,
        client_preview_path: paths.client_preview,
        width,
        height,
        mime_type: original.type,
        size_bytes: original.file.size,
        album_id,
        gallery: album.gallery,
        is_visible: true,
      })
      .select(mediaFields)
      .single();
    if (error) throw new Error("Could not save photo.");
    return NextResponse.json(
      { media: mediaDTO(data) },
      { status: 201, headers: privateHeaders },
    );
  } catch (e) {
    for (const item of stored)
      await db.storage.from(item.bucket).remove([item.path]);
    return fail(e instanceof Error ? e.message : "Upload failed.", 400);
  }
}
