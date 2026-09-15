import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail, jsonBody, privateHeaders, uuid } from "@/lib/security";
import { safeHref } from "@/lib/safe-url";
export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const db = getSupabaseAdmin();
    const [s, c] = await Promise.all([
      db
        .from("site_settings")
        .select("site_name,tagline,contact_email,instagram_url")
        .eq("id", "main")
        .single(),
      db
        .from("page_sections")
        .select("*")
        .eq("page", "home")
        .order("sort_order"),
    ]);
    if (s.error || c.error) throw new Error();
    return NextResponse.json(
      { settings: s.data, sections: c.data },
      { headers: privateHeaders },
    );
  } catch {
    return fail("Could not load settings.", 503);
  }
}
export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized", 401);
  try {
    const b = await jsonBody(request);
    if (
      !b.settings ||
      !Array.isArray(b.sections) ||
      b.sections.length > 50 ||
      !Array.isArray(b.deletedIds) ||
      !b.deletedIds.every(uuid)
    )
      return fail("Invalid settings.");
    const settings: Record<string, string | null> = {};
    for (const k of [
      "site_name",
      "tagline",
      "contact_email",
      "instagram_url",
    ]) {
      const v = b.settings[k] || "";
      if (typeof v !== "string" || v.length > 500)
        return fail("Invalid settings text.");
      settings[k] = v.trim();
    }
    if (settings.instagram_url && !safeHref(settings.instagram_url))
      return fail("Use a valid HTTPS Instagram URL.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email || ""))
      return fail("Enter a valid contact email.");
    const sections = [];
    for (let i = 0; i < b.sections.length; i++) {
      const s = b.sections[i];
      if (
        !uuid(s.id) ||
        !["text", "cta"].includes(s.section_type) ||
        typeof s.is_visible !== "boolean"
      )
        return fail("Invalid section.");
      const row: Record<string, unknown> = {
        id: s.id,
        page: "home",
        section_type: s.section_type,
        is_visible: s.is_visible,
        sort_order: i,
        updated_at: new Date().toISOString(),
      };
      for (const k of [
        "title",
        "subtitle",
        "body",
        "image_url",
        "button_label",
        "button_href",
      ]) {
        const v = s[k] || "";
        if (typeof v !== "string" || v.length > (k === "body" ? 5000 : 500))
          return fail("Section text is too long.");
        if ((k === "image_url" || k === "button_href") && v && !safeHref(v))
          return fail("Use a relative path or HTTPS URL.");
        row[k] = v;
      }
      sections.push(row);
    }
    const { error } = await getSupabaseAdmin().rpc("save_site_content", {
      new_settings: settings,
      new_sections: sections,
      deleted_ids: b.deletedIds,
    });
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: privateHeaders });
  } catch {
    return fail("Could not save website settings.", 503);
  }
}
