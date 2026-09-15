import { NextResponse } from "next/server";
import { adminCookie, createAdminSessionValue } from "@/lib/admin-auth";
import {
  equal,
  fail,
  jsonBody,
  privateHeaders,
  rateLimit,
} from "@/lib/security";
export async function POST(request: Request) {
  try {
    if (!(await rateLimit(request, "admin-login", 8, 900)))
      return fail("Too many attempts. Try again in 15 minutes.", 429);
    const { password } = await jsonBody(request);
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || expected.length < 16)
      return fail("Sign-in is temporarily unavailable.", 503);
    if (typeof password !== "string" || !equal(password, expected))
      return fail("Incorrect password.", 401);
    const response = NextResponse.json(
      { success: true },
      { headers: privateHeaders },
    );
    response.cookies.set(adminCookie.name, createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: adminCookie.maxAge,
    });
    return response;
  } catch {
    return fail("Sign-in is temporarily unavailable.", 503);
  }
}
