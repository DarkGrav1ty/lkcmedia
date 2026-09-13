import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getSupabaseAdmin();
    const [{ data: settings, error: settingsError }, { data: sections, error: sectionsError }] = await Promise.all([
        db.from("site_settings").select("*").eq("id", "main").single(),
        db.from("page_sections").select("*").eq("page", "home").order("sort_order"),
    ]);
    if (settingsError || sectionsError) return NextResponse.json({ error: settingsError?.message || sectionsError?.message }, { status: 500 });
    return NextResponse.json({ settings, sections });
}

export async function PUT(request: Request) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const db = getSupabaseAdmin();

    if (body.settings) {
        const { error } = await db.from("site_settings").upsert({ id: "main", ...body.settings, updated_at: new Date().toISOString() });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (Array.isArray(body.sections)) {
        for (let i = 0; i < body.sections.length; i++) {
            const section = body.sections[i];
            const row = {
                id: section.id,
                page: "home",
                section_type: section.section_type,
                title: section.title || "",
                subtitle: section.subtitle || "",
                body: section.body || "",
                image_url: section.image_url || null,
                button_label: section.button_label || null,
                button_href: section.button_href || null,
                is_visible: section.is_visible !== false,
                sort_order: i,
                updated_at: new Date().toISOString(),
            };
            const { error } = await db.from("page_sections").upsert(row);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    if (Array.isArray(body.deletedIds) && body.deletedIds.length) {
        const { error } = await db.from("page_sections").delete().in("id", body.deletedIds);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
