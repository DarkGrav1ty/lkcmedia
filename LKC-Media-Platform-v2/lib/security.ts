import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase-admin";
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export function fail(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: privateHeaders },
  );
}
export function equal(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export function signingSecret() {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s || s.length < 16) throw new Error("Session configuration unavailable");
  return s;
}
export function sign(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("hex");
}
export async function jsonBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new Error("JSON required");
  const text = await request.text();
  if (text.length > 32768) throw new Error("Request too large");
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Object required");
  return body;
}
export async function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  seconds: number,
) {
  // CF overwrites this header at the trusted edge. Non-edge development shares one bucket.
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const key = sign(`rate:${scope}:${ip}`);
  const { data, error } = await getSupabaseAdmin().rpc("take_rate_limit", {
    bucket_key: key,
    max_attempts: limit,
    window_seconds: seconds,
  });
  if (error) throw new Error("Rate limiter unavailable");
  return data === true;
}
export const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
