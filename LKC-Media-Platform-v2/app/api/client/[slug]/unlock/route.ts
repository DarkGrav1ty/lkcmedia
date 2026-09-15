import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  activeAlbum,
  clientCookie,
  createClientSession,
  verifyPin,
} from "@/lib/client-auth";
import { fail, jsonBody, privateHeaders, rateLimit } from "@/lib/security";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    if (
      !(await rateLimit(
        request,
        `gallery-unlock:${slug.slice(0, 100)}`,
        8,
        900,
      ))
    )
      return fail("Too many attempts. Try again in 15 minutes.", 429);
    const { pin } = await jsonBody(request);
    if (typeof pin !== "string" || !/^\d{6,12}$/.test(pin))
      return fail("Gallery unavailable or PIN incorrect.", 401);
    const { data: album, error } = await getSupabaseAdmin()
      .from("albums")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (
      !album ||
      !album.is_private ||
      !activeAlbum(album) ||
      !album.pin_hash ||
      !verifyPin(pin, album.pin_hash)
    )
      return fail("Gallery unavailable or PIN incorrect.", 401);
    const response = NextResponse.json(
      { success: true },
      { headers: privateHeaders },
    );
    response.cookies.set(clientCookie(album.id), createClientSession(album), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });
    return response;
  } catch {
    return fail("Gallery access is temporarily unavailable.", 503);
  }
}
