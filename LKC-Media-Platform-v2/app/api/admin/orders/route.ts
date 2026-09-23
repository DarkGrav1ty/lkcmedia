import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail, privateHeaders } from "@/lib/security";
export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("photo_orders").select("*,albums(name),client_collections(share_token)").order("created_at", { ascending: false }).limit(250);
  if (error) return fail("Could not load orders.", 503);
  return NextResponse.json({ orders: data || [] }, { headers: privateHeaders });
}
