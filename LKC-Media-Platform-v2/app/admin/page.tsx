import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import AdminCMS from "@/components/admin/AdminCMS";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    if (!(await isAdminAuthenticated())) {
        redirect("/admin/login");
    }

    const db = getSupabaseAdmin();

    const [
        bookingResult,
        settingsResult,
        sectionsResult,
        mediaResult,
    ] = await Promise.all([
        db
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false }),

        db
            .from("site_settings")
            .select("*")
            .eq("id", "main")
            .single(),

        db
            .from("page_sections")
            .select("*")
            .eq("page", "home")
            .order("sort_order"),

        db
            .from("media_assets")
            .select("*")
            .order("created_at", { ascending: false }),
    ]);

    if (bookingResult.error) {
        console.error("ADMIN_SUPABASE_ERROR bookings:", bookingResult.error);
        throw new Error(`Bookings query failed: ${bookingResult.error.message}`);
    }

    if (settingsResult.error) {
        console.error("ADMIN_SUPABASE_ERROR site_settings:", settingsResult.error);
        throw new Error(`Site settings query failed: ${settingsResult.error.message}`);
    }

    if (sectionsResult.error) {
        console.error("ADMIN_SUPABASE_ERROR page_sections:", sectionsResult.error);
        throw new Error(`Page sections query failed: ${sectionsResult.error.message}`);
    }

    if (mediaResult.error) {
        console.error("ADMIN_SUPABASE_ERROR media_assets:", mediaResult.error);
        throw new Error(`Media assets query failed: ${mediaResult.error.message}`);
    }

    return (
        <AdminCMS
            initialBookings={bookingResult.data || []}
            initialSettings={settingsResult.data}
            initialSections={sectionsResult.data || []}
            initialMedia={mediaResult.data || []}
        />
    );
}