import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import AdminCMS from "@/components/admin/AdminCMS";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    if (!(await isAdminAuthenticated())) {
        redirect("/admin/login");
    }

    try {
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

        const errors = [
            ["bookings", bookingResult.error],
            ["site_settings", settingsResult.error],
            ["page_sections", sectionsResult.error],
            ["media_assets", mediaResult.error],
        ].filter(([, error]) => error);

        if (errors.length > 0) {
            return (
                <main
                    style={{
                        padding: "40px",
                        color: "white",
                        background: "#07090d",
                        minHeight: "100vh",
                        fontFamily: "monospace",
                    }}
                >
                    <h1>Admin Diagnostic</h1>

                    {errors.map(([table, error]) => (
                        <pre
                            key={String(table)}
                            style={{
                                whiteSpace: "pre-wrap",
                                marginTop: "24px",
                            }}
                        >
                            {String(table)}:{" "}
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    ))}
                </main>
            );
        }

        return (
            <AdminCMS
                initialBookings={bookingResult.data || []}
                initialSettings={settingsResult.data}
                initialSections={sectionsResult.data || []}
                initialMedia={mediaResult.data || []}
            />
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : String(error);

        return (
            <main
                style={{
                    padding: "40px",
                    color: "white",
                    background: "#07090d",
                    minHeight: "100vh",
                    fontFamily: "monospace",
                }}
            >
                <h1>Admin Diagnostic</h1>

                <pre
                    style={{
                        whiteSpace: "pre-wrap",
                        marginTop: "24px",
                    }}
                >
                    {message}
                </pre>
            </main>
        );
    }
}