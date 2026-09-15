import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { albumFields } from "@/lib/media";
import { albumInput } from "@/lib/album-input";
import { fail, jsonBody, privateHeaders, uuid } from "@/lib/security";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Album not found.", 404);
    const db = getSupabaseAdmin();
    const { data: existing, error: readError } = await db
      .from("albums")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return fail("Album not found.", 404);
    let row;
    try {
      row = albumInput(await jsonBody(request), existing);
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Invalid album.");
    }
    const { data, error } = await db
      .from("albums")
      .update(row)
      .eq("id", id)
      .select(albumFields)
      .single();
    if (error)
      return fail("Could not save album. Check that its URL is unique.", 409);
    return NextResponse.json({ album: data }, { headers: privateHeaders });
  } catch {
    return fail("Could not save album.", 503);
  }
}
export async function DELETE(_request: Request, { params }: Context) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const { id } = await params;
    if (!uuid(id)) return fail("Album not found.", 404);
    const db = getSupabaseAdmin();
    const { count, error: ce } = await db
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("album_id", id);
    if (ce) throw ce;
    if (count)
      return fail("Move or remove all photos before deleting this album.", 409);
    const { error } = await db.from("albums").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch {
    return fail("Could not delete album.", 503);
  }
}
