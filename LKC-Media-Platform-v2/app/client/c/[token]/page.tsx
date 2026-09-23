import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { canViewCollection,collectionActive } from "@/lib/collection-auth";
import CollectionUnlock from "@/components/CollectionUnlock";
import CollectionGallery from "@/components/CollectionGallery";
export const dynamic="force-dynamic";
export const metadata={title:"Client gallery | LKC Media",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default async function Page({params}:{params:Promise<{token:string}>}){const{token}=await params;const db=getSupabaseAdmin();const{data:c,error}=await db.from("client_collections").select("*,albums(name,event_date),subjects(jersey_number,display_name)").eq("share_token",token).maybeSingle();if(error)throw error;if(!c||!collectionActive(c))notFound();const subject=Array.isArray(c.subjects)?c.subjects[0]:c.subjects;const album=Array.isArray(c.albums)?c.albums[0]:c.albums;const subjectName=subject?.display_name|| (subject?.jersey_number?`Player #${subject.jersey_number}`:"Your photos");if(!(await canViewCollection(c)))return <main className="page-shell text-center"><p className="eyebrow">Private client gallery</p><h1>{c.label}</h1><p className="mt-3 text-slate-300">{album?.name} · {subjectName}</p><p className="mt-4 text-slate-400">Enter the PIN shared with you to view your photos.</p><CollectionUnlock token={token}/></main>;
return <main className="page-shell"><p className="eyebrow">Your client gallery</p><h1>{c.label}</h1><p className="mt-3 text-slate-300">{album?.name} · {subjectName}</p><CollectionGallery token={token} collectionId={c.id} subjectId={c.subject_id} albumId={c.album_id} downloads={c.downloads_enabled}/></main>}
