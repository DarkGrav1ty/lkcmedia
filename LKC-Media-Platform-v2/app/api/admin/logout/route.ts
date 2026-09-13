import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-auth";

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set(adminCookie.name, "", { path: "/", maxAge: 0 });
    return response;
}
