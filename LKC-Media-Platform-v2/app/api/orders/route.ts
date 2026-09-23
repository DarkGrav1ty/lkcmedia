import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { photoPriceCents } from "@/lib/photo-pricing";
import { fail, jsonBody, rateLimit, uuid } from "@/lib/security";

const OWNER_EMAIL = "logancasey737@gmail.com";
const FROM_EMAIL = "LKC Media <bookings@lkcmedia-az.com>";

function esc(v: unknown) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
async function email(to: string[], subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }) });
    return r.ok;
  } catch { return false; }
}
function orderNumber() {
  return `LKC-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    if (!(await rateLimit(request, "photo-order", 10, 3600))) return fail("Too many order attempts. Please try again later.", 429);
    const body = await jsonBody(request);
    const albumId = body.album_id;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const emailAddress = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    const instagram = typeof body.instagram === "string" ? body.instagram.trim().slice(0, 100) : null;
    const paymentMethod = body.payment_method;
    const mediaIds = Array.isArray(body.media_ids) ? [...new Set(body.media_ids.filter(uuid))] : [];
    if (!uuid(albumId) || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) return fail("Enter your name and a valid email address.");
    if (!["cash", "apple_cash", "zelle"].includes(paymentMethod)) return fail("Choose Cash, Apple Cash, or Zelle.");
    if (!mediaIds.length || mediaIds.length > 1000) return fail("Select at least one photo.");

    const db = getSupabaseAdmin();
    const { data: album } = await db.from("albums").select("id,name,is_visible,expires_at").eq("id", albumId).eq("is_visible", true).maybeSingle();
    if (!album || (album.expires_at && Date.parse(album.expires_at) <= Date.now())) return fail("This gallery is unavailable.", 404);
    const { data: valid, error: ve } = await db.from("media_assets").select("id").eq("album_id", albumId).eq("is_visible", true).in("id", mediaIds);
    if (ve || !valid || valid.length !== mediaIds.length) return fail("One or more selected photos are unavailable.");

    const amount = photoPriceCents(mediaIds.length);
    const number = orderNumber();
    const { data: order, error } = await db.from("photo_orders").insert({ order_number: number, album_id: albumId, customer_name: name, customer_email: emailAddress, customer_instagram: instagram || null, photo_count: mediaIds.length, amount_cents: amount, payment_method: paymentMethod }).select("id,order_number").single();
    if (error || !order) return fail("Could not create your order.", 503);
    const { error: ie } = await db.from("photo_order_items").insert(mediaIds.map((media_id) => ({ order_id: order.id, media_id })));
    if (ie) { await db.from("photo_orders").delete().eq("id", order.id); return fail("Could not save your selected photos.", 503); }

    const dollars = `$${(amount / 100).toFixed(2)}`;
    const method = paymentMethod === "apple_cash" ? "Apple Cash" : paymentMethod === "zelle" ? "Zelle" : "Cash";
    await Promise.allSettled([
      email([OWNER_EMAIL], `Photo order ${number} — ${dollars}`, `<h2>New LKC Media photo order</h2><p><b>${esc(number)}</b></p><p>${esc(name)} · ${esc(emailAddress)}</p><p>${mediaIds.length} photos · <b>${dollars}</b> · ${method}</p><p>Open Admin → Orders to review and mark payment received.</p>`, emailAddress),
      email([emailAddress], `LKC Media order ${number} received`, `<h2>We received your photo order.</h2><p>Order <b>${esc(number)}</b></p><p>${mediaIds.length} photos · <b>${dollars}</b></p><p>Payment method: <b>${method}</b></p><p>Your order is awaiting payment confirmation. After payment is confirmed, your private download gallery will be generated and emailed to you.</p>`),
    ]);
    return NextResponse.json({ order_number: number, photo_count: mediaIds.length, amount_cents: amount, payment_method: paymentMethod }, { status: 201 });
  } catch (e) {
    console.error("PHOTO ORDER ERROR", e);
    return fail(e instanceof Error ? e.message : "Could not place order.", 400);
  }
}
