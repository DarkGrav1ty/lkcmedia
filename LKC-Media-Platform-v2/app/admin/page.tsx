import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import AdminCMS from "@/components/admin/AdminCMS";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const db = getSupabaseAdmin();
  const [b, s, c] = await Promise.all([
    db
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("site_settings")
      .select("site_name,tagline,contact_email,instagram_url")
      .eq("id", "main")
      .single(),
    db.from("page_sections").select("*").order("sort_order"),
  ]);
  if (b.error || s.error || c.error) throw new Error("Admin data unavailable");
  return (
    <AdminCMS
      initialBookings={b.data || []}
      initialSettings={s.data}
      initialSections={c.data || []}
      initialMedia={[]}
    />
  );
}
