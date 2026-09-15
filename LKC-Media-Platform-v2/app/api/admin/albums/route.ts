import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { albumFields } from "@/lib/media";
import { albumInput } from "@/lib/album-input";
import { fail, jsonBody, privateHeaders } from "@/lib/security";
export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("albums")
      .select(albumFields)
      .order("sort_order")
      .order("id");
    if (error) throw error;
    return NextResponse.json({ albums: data }, { headers: privateHeaders });
  } catch {
    return fail("Could not load albums.", 503);
  }
}
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  let row;
  try {
    row = albumInput(await jsonBody(request));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Invalid album.");
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("albums")
      .insert(row)
      .select(albumFields)
      .single();
    if (error)
      return fail(
        error.code === "23505"
          ? "That gallery URL is already used."
          : "Could not save album.",
        409,
      );
    return NextResponse.json(
      { album: data },
      { status: 201, headers: privateHeaders },
    );
  } catch {
    return fail("Could not save album.", 503);
  }
}
