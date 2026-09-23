import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import AdminOperations from "@/components/admin/AdminOperations";
export const dynamic="force-dynamic";
export default async function AdminPage(){if(!(await isAdminAuthenticated()))redirect("/admin/login");const{data,error}=await getSupabaseAdmin().from("bookings").select("*").order("created_at",{ascending:false}).limit(100);if(error)throw new Error("Admin data unavailable");return <AdminOperations initialBookings={data||[]}/>}
