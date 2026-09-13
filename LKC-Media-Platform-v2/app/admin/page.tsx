import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import AdminCMS from "@/components/admin/AdminCMS";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    if (!(await isAdminAuthenticated())) redirect("/admin/login");
    const db = getSupabaseAdmin();
    const [bookingResult, settingsResult, sectionsResult, mediaResult] = await Promise.all([
        db.from("bookings").select("*").order("created_at", { ascending:false }),
        db.from("site_settings").select("*").eq("id", "main").single(),
        db.from("page_sections").select("*").eq("page", "home").order("sort_order"),
        db.from("media_assets").select("*").order("created_at", { ascending:false }),
    ]);
    const error = bookingResult.error || settingsResult.error || sectionsResult.error || mediaResult.error;
    if (error) throw new Error(`Admin database setup required: ${error.message}`);
    return <AdminCMS initialBookings={bookingResult.data || []} initialSettings={settingsResult.data} initialSections={sectionsResult.data || []} initialMedia={mediaResult.data || []}/>;
}
