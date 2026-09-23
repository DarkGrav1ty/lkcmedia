import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail,privateHeaders,uuid } from "@/lib/security";
export async function GET(request:Request){if(!(await isAdminAuthenticated()))return fail("Unauthorized",401);const albumId=new URL(request.url).searchParams.get("album_id");if(!uuid(albumId))return fail("Choose an event.");const db=getSupabaseAdmin();const{data:media,error:me}=await db.from("media_assets").select("id").eq("album_id",albumId);if(me)return fail("Could not load tags.",503);const ids=(media||[]).map(x=>x.id);if(!ids.length)return NextResponse.json({tags:[]},{headers:privateHeaders});const{data,error}=await db.from("photo_subjects").select("media_id,subject_id").in("media_id",ids);if(error)return fail("Could not load tags.",503);return NextResponse.json({tags:data||[]},{headers:privateHeaders});}
