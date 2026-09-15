import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mediaFields, mediaDTO } from "@/lib/media";
import { fail, jsonBody, privateHeaders, uuid } from "@/lib/security";
import { imageBytes } from "@/lib/upload";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Invalid photo.");
    const b = await jsonBody(request);
    const u: Record<string, unknown> = {};
    for (const k of ["is_featured", "is_visible"])
      if (b[k] !== undefined) {
        if (typeof b[k] !== "boolean") return fail("Invalid visibility.");
        u[k] = b[k];
      }
    for (const k of ["sport", "alt_text"])
      if (b[k] !== undefined) {
        if (typeof b[k] !== "string" || b[k].length > 240)
          return fail("Text is too long.");
        u[k] = b[k].trim();
      }
    if (b.sort_order !== undefined) {
      if (
        !Number.isSafeInteger(b.sort_order) ||
        Math.abs(b.sort_order) > 100000
      )
        return fail("Invalid order.");
      u.sort_order = b.sort_order;
    }
    const db = getSupabaseAdmin();
    if (b.album_id !== undefined) {
      if (!uuid(b.album_id)) return fail("Choose an album.");
      const { data: a } = await db
        .from("albums")
        .select("id,gallery")
        .eq("id", b.album_id)
        .single();
      if (!a) return fail("Album unavailable.");
      u.album_id = a.id;
      u.gallery = a.gallery;
    }
    if (!Object.keys(u).length) return fail("No changes provided.");
    const { data, error } = await db
      .from("media_assets")
      .update(u)
      .eq("id", id)
      .select(mediaFields)
      .single();
    if (error) throw error;
    return NextResponse.json(
      { media: mediaDTO(data) },
      { headers: privateHeaders },
    );
  } catch {
    return fail("Could not update photo.", 503);
  }
}
// Regenerate previews for legacy media without changing original bytes.
export async function POST(request: Request, { params }: Context) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  const db = getSupabaseAdmin(),
    created: string[] = [];
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Invalid photo.");
    const { data: old } = await db
      .from("media_assets")
      .select("id,preview_path,thumbnail_path,client_preview_path")
      .eq("id", id)
      .single();
    if (!old) return fail("Photo unavailable.", 404);
    const form = await request.formData(),
      patch: Record<string, unknown> = {};
    for (const [field, column] of [
      ["preview", "preview_path"],
      ["thumbnail", "thumbnail_path"],
      ["client_preview", "client_preview_path"],
    ]) {
      const image = await imageBytes(form.get(field), true),
        path = `${id}/${crypto.randomUUID()}-${field}.jpeg`;
      const { error } = await db.storage
        .from("lkc-previews")
        .upload(path, image.bytes, { contentType: image.type });
      if (error) throw error;
      created.push(path);
      patch[column] = path;
    }
    const w = Number(form.get("width")),
      h = Number(form.get("height"));
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1)
      throw new Error();
    patch.width = w;
    patch.height = h;
    const { data, error } = await db
      .from("media_assets")
      .update(patch)
      .eq("id", id)
      .select(mediaFields)
      .single();
    if (error) throw error;
    const previous = [
      old.preview_path,
      old.thumbnail_path,
      old.client_preview_path,
    ].filter(Boolean);
    if (previous.length) await db.storage.from("lkc-previews").remove(previous);
    return NextResponse.json(
      { media: mediaDTO(data) },
      { headers: privateHeaders },
    );
  } catch {
    if (created.length) await db.storage.from("lkc-previews").remove(created);
    return fail("Could not regenerate previews.", 503);
  }
}
export async function DELETE(_request: Request, { params }: Context) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Invalid photo.");
    const db = getSupabaseAdmin();
    // Removing the library record deliberately retains the original for recovery.
    const { error } = await db
      .from("media_assets")
      .update({ is_visible: false, is_featured: false, album_id: null })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch {
    return fail("Could not remove photo.", 503);
  }
}
