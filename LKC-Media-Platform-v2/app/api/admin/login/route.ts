import { NextResponse } from "next/server";
import { adminCookie, createAdminSessionValue } from "@/lib/admin-auth";

export async function POST(request: Request) {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
        return NextResponse.json({ error: "ADMIN_PASSWORD is not configured." }, { status: 500 });
    }

    if (password !== expected) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(adminCookie.name, createAdminSessionValue(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: adminCookie.maxAge,
    });
    return response;
}
