import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail,privateHeaders,uuid } from "@/lib/security";
export async function DELETE(_r:Request,{params}:{params:Promise<{id:string}>}){if(!(await isAdminAuthenticated()))return fail("Unauthorized",401);const{id}=await params;if(!uuid(id))return fail("Invalid client link.");const{error}=await getSupabaseAdmin().from("client_collections").update({is_active:false,auth_version:crypto.randomUUID(),updated_at:new Date().toISOString()}).eq("id",id);if(error)return fail("Could not revoke link.",503);return NextResponse.json({success:true},{headers:privateHeaders});}
