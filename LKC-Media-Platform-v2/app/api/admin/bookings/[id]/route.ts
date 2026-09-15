import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail, jsonBody, privateHeaders, uuid } from "@/lib/security";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const { id } = await params,
      b = await jsonBody(request);
    if (
      !uuid(id) ||
      !["new", "contacted", "confirmed", "completed", "cancelled"].includes(
        b.status,
      )
    )
      return fail("Invalid booking update.");
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .update({ status: b.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail("Booking not found.", 404);
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch {
    return fail("Could not update booking.", 503);
  }
}
