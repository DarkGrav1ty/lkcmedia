import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function makeSlug(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function GET() {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const db = getSupabaseAdmin();

    const { data, error } = await db
        .from("albums")
        .select("*")
        .order("event_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        albums: data || [],
    });
}

export async function POST(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const gallery = body.gallery;
    const eventDate = body.event_date || null;

    if (!name) {
        return NextResponse.json(
            { error: "Group name is required." },
            { status: 400 }
        );
    }

    if (!["sports", "portraits"].includes(gallery)) {
        return NextResponse.json(
            { error: "Invalid gallery." },
            { status: 400 }
        );
    }

    const db = getSupabaseAdmin();

    let slug = makeSlug(name);

    if (!slug) {
        slug = crypto.randomUUID();
    }

    const { data: existing } = await db
        .from("albums")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    const { data, error } = await db
        .from("albums")
        .insert({
            name,
            slug,
            gallery,
            event_date: eventDate,
            is_visible: true,
        })
        .select("*")
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { album: data },
        { status: 201 }
    );
}