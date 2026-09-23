import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail, privateHeaders, uuid } from "@/lib/security";
const FROM_EMAIL = "LKC Media <bookings@lkcmedia-az.com>";
async function sendDelivery(to: string, order: string, url: string) {
  const key = process.env.RESEND_API_KEY; if (!key) return false;
  try { const r = await fetch("https://api.resend.com/emails", { method:"POST", headers:{ Authorization:`Bearer ${key}`, "Content-Type":"application/json" }, body:JSON.stringify({ from:FROM_EMAIL, to:[to], subject:`Your LKC Media photos are ready — ${order}`, html:`<h2>Your photos are ready.</h2><p>Payment for <b>${order}</b> has been confirmed.</p><p><a href="${url}">Open your private download gallery</a></p><p>Keep this link private. It provides access to the photos included in your order.</p>` }) }); return r.ok; } catch { return false; }
}
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  const { id } = await params; if (!uuid(id)) return fail("Order unavailable.", 404);
  const db = getSupabaseAdmin();
  const { data: order, error } = await db.from("photo_orders").select("*").eq("id", id).maybeSingle();
  if (error || !order) return fail("Order unavailable.", 404);
  if (order.payment_status === "paid" && order.client_collection_id) {
    const { data: c } = await db.from("client_collections").select("share_token").eq("id", order.client_collection_id).maybeSingle();
    return NextResponse.json({ order, client_url: c ? `/client/c/${c.share_token}` : null }, { headers: privateHeaders });
  }
  const { data: items, error: itemError } = await db.from("photo_order_items").select("media_id").eq("order_id", id);
  if (itemError || !items?.length) return fail("This order has no photos.");
  const { data: subject, error: se } = await db.from("subjects").insert({ album_id: order.album_id, display_name: `Order ${order.order_number}`, subject_type: "other", notes: `Paid photo order ${order.order_number}` }).select("id").single();
  if (se || !subject) return fail("Could not prepare delivery.", 503);
  const { error: te } = await db.from("photo_subjects").upsert(items.map((x) => ({ media_id: x.media_id, subject_id: subject.id })), { onConflict: "media_id,subject_id", ignoreDuplicates: true });
  if (te) return fail("Could not attach purchased photos.", 503);
  const token = randomBytes(32).toString("base64url");
  const { data: collection, error: ce } = await db.from("client_collections").insert({ album_id: order.album_id, subject_id: subject.id, label: `${order.order_number} · ${order.customer_name}`, share_token: token, downloads_enabled: true, is_active: true }).select("id,share_token").single();
  if (ce || !collection) return fail("Could not create client gallery.", 503);
  const now = new Date().toISOString();
  const { data: updated, error: ue } = await db.from("photo_orders").update({ payment_status:"paid", order_status:"fulfilled", client_collection_id:collection.id, paid_at:now, fulfilled_at:now }).eq("id", id).select("*").single();
  if (ue) return fail("Gallery created, but order status could not be updated.", 503);
  const origin = new URL(request.url).origin;
  const clientUrl = `${origin}/client/c/${collection.share_token}`;
  const email_sent = await sendDelivery(order.customer_email, order.order_number, clientUrl);
  return NextResponse.json({ order: updated, client_url: clientUrl, email_sent }, { headers: privateHeaders });
}
