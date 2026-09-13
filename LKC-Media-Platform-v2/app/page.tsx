import Link from "next/link";
import GalleryLightbox, { GalleryPhoto } from "@/components/GalleryLightbox";
import Pricing from "@/components/Pricing";
import BookingButton from "@/components/BookingButton";
import CMSSections from "@/components/CMSSections";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const featured: GalleryPhoto[] = [
    { id:"demo-1", preview:"/images/photo-1.jpg", title:"Game Night", price:7 },
    { id:"demo-2", preview:"/images/photo-2.jpg", title:"Under The Lights", price:5 },
    { id:"demo-3", preview:"/images/photo-3.jpg", title:"The Moment", price:10 },
    { id:"demo-4", preview:"/images/photo-4.jpg", title:"Portrait", price:7 },
    { id:"demo-5", preview:"/images/photo-5.jpg", title:"Sideline", price:7 },
];

async function cms() {
    try {
        const db=getSupabaseAdmin();
        const [a,b]=await Promise.all([db.from("site_settings").select("*").eq("id","main").single(),db.from("page_sections").select("*").eq("page","home").order("sort_order")]);
        return {settings:a.data,sections:b.data||[]};
    } catch { return {settings:null,sections:[]}; }
}
export const dynamic="force-dynamic";

export default async function Home() {
    const {settings,sections}=await cms();
    return <main>
        <section className="relative min-h-[92vh] overflow-hidden pt-20"><img src="/images/hero.jpg" alt="LKC Media" className="absolute inset-0 h-full w-full object-cover object-[center_22%]"/><div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10"/><div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-transparent to-transparent"/><div className="relative mx-auto flex min-h-[calc(92vh-5rem)] max-w-[1500px] items-end px-5 pb-16 md:px-10 md:pb-24"><div className="max-w-5xl"><p className="mb-5 text-xs font-black uppercase tracking-[.3em] text-[#45a9ff]">Sports + Portrait Photography</p><h1 className="text-5xl font-black uppercase leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[7.5rem]">More Than<br/>A Game.</h1><p className="mt-6 max-w-lg text-base leading-7 text-white/65 md:text-lg">{settings?.tagline||"LKC Media. Real moments, lasting memories."}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/gallery" className="rounded-full bg-[#0088ff] px-6 py-3.5 font-black">View Galleries</Link><Link href="#pricing" className="rounded-full border border-white/20 bg-black/20 px-6 py-3.5 font-black">Pricing</Link></div></div></div></section>
        <section className="px-5 py-24 md:px-10"><div className="mx-auto max-w-7xl"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.28em] text-[#0088ff]">Featured</p><h2 className="mt-3 text-4xl font-black uppercase tracking-[-.04em] md:text-6xl">Recent Work</h2></div><Link href="/gallery" className="text-sm font-black text-white/55 hover:text-white">All galleries →</Link></div><GalleryLightbox photos={featured}/></div></section>
        <CMSSections sections={sections}/><Pricing/>
        <section id="book" className="border-t border-white/10 px-5 py-28 text-center md:px-10"><div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-[#0088ff]">Booking</p><h2 className="mt-4 text-5xl font-black uppercase tracking-[-.05em] md:text-7xl">Want me there?</h2><p className="mx-auto mt-5 max-w-xl text-white/50">Send the game, date, location, or portrait details and we can figure it out.</p><BookingButton className="mt-8 inline-block rounded-full bg-[#0088ff] px-7 py-4 font-black">Book a Shoot</BookingButton></div></section>
        <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/35">© 2026 {settings?.site_name||"LKC Media"}</footer>
    </main>;
}
