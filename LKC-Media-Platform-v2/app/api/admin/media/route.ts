import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("media_assets").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ media: data || [] });
}

export async function POST(request: Request) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Images only." }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 20 MB." }, { status: 400 });

    const db = getSupabaseAdmin();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await db.storage.from("lkc-media").upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    const { data: publicUrl } = db.storage.from("lkc-media").getPublicUrl(path);
    const { data, error } = await db.from("media_assets").insert({ file_name: file.name, storage_path: path, public_url: publicUrl.publicUrl, mime_type: file.type, size_bytes: file.size }).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ media: data }, { status: 201 });
}
