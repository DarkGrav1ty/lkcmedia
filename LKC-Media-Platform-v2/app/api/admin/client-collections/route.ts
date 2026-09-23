import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { hashPin } from "@/lib/client-auth";
import { fail,jsonBody,privateHeaders,uuid } from "@/lib/security";
export async function GET(request:Request){
 if(!(await isAdminAuthenticated())) return fail("Unauthorized",401); const albumId=new URL(request.url).searchParams.get("album_id"); if(!uuid(albumId)) return fail("Choose an event.");
 const {data,error}=await getSupabaseAdmin().from("client_collections").select("id,album_id,subject_id,label,share_token,expires_at,downloads_enabled,is_active,created_at,subjects(jersey_number,display_name)").eq("album_id",albumId).order("created_at",{ascending:false});
 if(error)return fail("Could not load client links.",503); return NextResponse.json({collections:data||[]},{headers:privateHeaders});
}
export async function POST(request:Request){
 if(!(await isAdminAuthenticated())) return fail("Unauthorized",401); try{const b=await jsonBody(request); if(!uuid(b.album_id)||!uuid(b.subject_id))return fail("Choose an event and athlete.");
 const label=typeof b.label==="string"&&b.label.trim()?b.label.trim().slice(0,160):"Client gallery"; const pin=typeof b.pin==="string"?b.pin.trim():""; if(pin&&!/^\d{6,12}$/.test(pin))return fail("PIN must be 6-12 digits.");
 const expires=b.expires_at?new Date(b.expires_at).toISOString():null; const token=randomBytes(24).toString("base64url");
 const {data,error}=await getSupabaseAdmin().from("client_collections").insert({album_id:b.album_id,subject_id:b.subject_id,label,share_token:token,pin_hash:pin?hashPin(pin):null,expires_at:expires,downloads_enabled:b.downloads_enabled!==false}).select("id,album_id,subject_id,label,share_token,expires_at,downloads_enabled,is_active,created_at").single();
 if(error)throw error; return NextResponse.json({collection:data},{status:201,headers:privateHeaders}); }catch{return fail("Could not create client link.",503)}
}
