"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronUp, Eye, EyeOff, FileImage, Globe2, LayoutDashboard, LogOut, MapPin, Plus, Save, Trash2, Upload, Users } from "lucide-react";

type Booking = { id:string; status:string; name:string; email:string; instagram:string|null; shoot_type:string; sport:string|null; shoot_date:string; location_name:string; location_address:string; package:string|null; details:string; created_at:string };
type Settings = { site_name:string; tagline:string; contact_email:string; instagram_url:string|null };
type Section = { id:string; section_type:string; title:string; subtitle:string; body:string; image_url:string|null; button_label:string|null; button_href:string|null; is_visible:boolean; sort_order:number };
type Media = {
    id: string;
    file_name: string;
    public_url: string;
    created_at: string;
    gallery: "sports" | "portraits";
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
};

type Props = { initialBookings: Booking[]; initialSettings: Settings; initialSections: Section[]; initialMedia: Media[] };
const statusOptions = ["new", "contacted", "confirmed", "completed", "cancelled"];
const input = "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-[#0088ff]";

export default function AdminCMS({ initialBookings, initialSettings, initialSections, initialMedia }: Props) {
    const router = useRouter();
    const [tab, setTab] = useState("dashboard");
    const [bookings, setBookings] = useState(initialBookings);
    const [settings, setSettings] = useState(initialSettings);
    const [sections, setSections] = useState(initialSections);
    const [media, setMedia] = useState(initialMedia);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 2500); return () => clearTimeout(t); }, [notice]);
    const newCount = bookings.filter((b) => b.status === "new").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;

    async function updateStatus(id:string, status:string) {
        setBookings((old) => old.map((b) => b.id === id ? { ...b, status } : b));
        const res = await fetch(`/api/admin/bookings/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) });
        if (!res.ok) { setNotice("Could not update booking."); router.refresh(); } else setNotice("Booking updated.");
    }

    async function saveSite() {
        setSaving(true);
        const res = await fetch("/api/admin/site", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({settings, sections, deletedIds}) });
        setSaving(false);
        if (!res.ok) { const x = await res.json(); return setNotice(x.error || "Save failed."); }
        setDeletedIds([]); setNotice("Website saved."); router.refresh();
    }

    function addSection(type:string) {
        setSections((old) => [...old, { id:crypto.randomUUID(), section_type:type, title:type === "text" ? "New Section" : "New Call To Action", subtitle:"", body:"Add your content here.", image_url:null, button_label:type === "cta" ? "Book a Shoot" : null, button_href:type === "cta" ? "#book" : null, is_visible:true, sort_order:old.length }]);
    }
    function patchSection(id:string, patch:Partial<Section>) { setSections((old) => old.map((s) => s.id === id ? {...s,...patch} : s)); }
    function removeSection(id:string) { setSections((old) => old.filter((s) => s.id !== id)); setDeletedIds((old) => [...old,id]); }
    function move(index:number, delta:number) { const target=index+delta; if(target<0||target>=sections.length)return; const copy=[...sections]; [copy[index],copy[target]]=[copy[target],copy[index]]; setSections(copy); }

    async function upload(file?:File) {
        if(!file)return; setNotice("Uploading image..."); const fd=new FormData(); fd.append("file",file);
        const res=await fetch("/api/admin/media",{method:"POST",body:fd}); const x=await res.json();
        if(!res.ok)return setNotice(x.error||"Upload failed."); setMedia((old)=>[x.media,...old]); setNotice("Image uploaded.");
    }
    async function updateMedia(
    id: string,
    patch: Partial<Pick<Media, "gallery" | "is_featured" | "is_visible" | "sort_order">>
) {
    const previous = media;

    setMedia((old) =>
        old.map((item) =>
            item.id === id
                ? { ...item, ...patch }
                : item
        )
    );

    const res = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
    });

    const result = await res.json();

    if (!res.ok) {
        setMedia(previous);
        setNotice(result.error || "Could not update image.");
        return;
    }

    setMedia((old) =>
        old.map((item) =>
            item.id === id
                ? result.media
                : item
        )
    );

    setNotice("Image updated.");
}
    async function logout(){ await fetch("/api/admin/logout",{method:"POST"}); router.replace("/admin/login"); router.refresh(); }

    const nav = [
        ["dashboard","Dashboard",LayoutDashboard], ["website","Website",Globe2], ["media","Media Library",FileImage], ["bookings","Bookings",Users],
    ] as const;

    return <div className="min-h-screen bg-[#07090d] text-white">
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-white/10 bg-[#090c12] p-5 lg:block">
            <div className="flex items-center gap-3"><img src="/logo/lkc-logo.png" className="h-11 w-11 rounded-xl object-cover" alt=""/><div><b>LKC MEDIA</b><p className="text-xs text-white/35">Content Manager</p></div></div>
            <nav className="mt-10 space-y-2">{nav.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${tab===id?"bg-[#0088ff]":"text-white/55 hover:bg-white/5 hover:text-white"}`}><Icon size={18}/>{label}{id==="bookings"&&newCount>0&&<span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] text-black">{newCount}</span>}</button>)}</nav>
            <button onClick={logout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/45 hover:bg-white/5 hover:text-white"><LogOut size={18}/>Sign Out</button>
        </aside>

        <main className="lg:pl-64">
            <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-white/10 bg-[#07090d]/90 px-5 backdrop-blur md:px-8">
                <div className="flex gap-2 overflow-x-auto lg:hidden">{nav.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${tab===id?"bg-[#0088ff]":"bg-white/5"}`}>{label}</button>)}</div>
                <div className="hidden lg:block"><p className="text-xs font-black uppercase tracking-[.25em] text-[#0088ff]">LKC Media CMS</p></div>
                <a href="/" target="_blank" className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/60 hover:text-white">View Site ↗</a>
            </header>
            <div className="mx-auto max-w-7xl p-5 md:p-8">
                {notice&&<div className="fixed bottom-6 right-6 z-[100] rounded-xl border border-white/10 bg-[#121822] px-5 py-3 text-sm shadow-2xl">{notice}</div>}

                {tab==="dashboard"&&<><h1 className="text-4xl font-black">Dashboard</h1><p className="mt-2 text-white/45">Run LKC Media from one place.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["New Bookings",newCount],["Confirmed",confirmed],["Website Sections",sections.length],["Media Assets",media.length]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-white/10 bg-[#0d1118] p-6"><p className="text-xs font-black uppercase tracking-[.16em] text-white/35">{label}</p><p className="mt-3 text-4xl font-black">{value}</p></div>)}</div><div className="mt-8 rounded-3xl border border-white/10 bg-[#0d1118] p-7"><h2 className="text-xl font-black">Quick Actions</h2><div className="mt-5 flex flex-wrap gap-3"><button onClick={()=>setTab("website")} className="rounded-xl bg-[#0088ff] px-5 py-3 font-bold">Edit Website</button><button onClick={()=>setTab("media")} className="rounded-xl border border-white/10 px-5 py-3 font-bold">Upload Images</button><button onClick={()=>setTab("bookings")} className="rounded-xl border border-white/10 px-5 py-3 font-bold">Manage Bookings</button></div></div></>}

                {tab==="bookings"&&<><h1 className="text-4xl font-black">Bookings</h1><p className="mt-2 text-white/45">Update requests as you work them.</p><div className="mt-8 space-y-4">{bookings.map((b)=><article key={b.id} className="rounded-2xl border border-white/10 bg-[#0d1118] p-6"><div className="flex flex-col gap-5 md:flex-row md:justify-between"><div><div className="flex items-center gap-3"><h2 className="text-xl font-black">{b.name}</h2><span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase text-white/50">{b.shoot_type}{b.sport?` • ${b.sport}`:""}</span></div><a href={`mailto:${b.email}`} className="mt-2 block text-sm text-[#58afff]">{b.email}</a><div className="mt-5 grid gap-3 text-sm text-white/55 sm:grid-cols-2"><span className="flex gap-2"><CalendarDays size={17}/>{new Date(`${b.shoot_date}T12:00:00`).toLocaleDateString()}</span><span className="flex gap-2"><MapPin size={17}/>{b.location_name}</span></div><p className="mt-4 max-w-3xl text-sm leading-6 text-white/50">{b.details}</p></div><select value={b.status} onChange={(e)=>updateStatus(b.id,e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-bold capitalize outline-none">{statusOptions.map((s)=><option key={s} value={s}>{s}</option>)}</select></div></article>)}</div></>}

                {tab === "media" && (
    <>
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black">
                    Media Library
                </h1>

                <p className="mt-2 text-white/45">
                    Upload, organize, and publish your photography.
                </p>
            </div>

            <label className="cursor-pointer rounded-xl bg-[#0088ff] px-5 py-3 font-bold">
                <Upload
                    className="mr-2 inline"
                    size={17}
                />

                Upload Image

                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                        upload(e.target.files?.[0])
                    }
                />
            </label>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {media.map((m) => (
                <article
                    key={m.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]"
                >
                    <button
                        type="button"
                        onClick={() =>
                            navigator.clipboard
                                .writeText(m.public_url)
                                .then(() =>
                                    setNotice("Image URL copied.")
                                )
                        }
                        className="block w-full"
                    >
                        <img
                            src={m.public_url}
                            alt={m.file_name}
                            className="aspect-[4/3] w-full object-cover"
                        />
                    </button>

                    <div className="p-4">
                        <p className="truncate text-sm font-black">
                            {m.file_name}
                        </p>

                        <p className="mt-1 text-[11px] text-white/30">
                            Click image to copy URL
                        </p>

                        <div className="mt-4">
                            <label className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">
                                Gallery
                            </label>

                            <select
                                value={m.gallery}
                                onChange={(e) =>
                                    updateMedia(m.id, {
                                        gallery: e.target.value as "sports" | "portraits",
                                    })
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0088ff]"
                            >
                                <option value="sports">
                                    Sports
                                </option>

                                <option value="portraits">
                                    Portraits
                                </option>
                            </select>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    updateMedia(m.id, {
                                        is_featured: !m.is_featured,
                                    })
                                }
                                className={`rounded-xl border px-3 py-2.5 text-xs font-black transition ${
                                    m.is_featured
                                        ? "border-[#0088ff] bg-[#0088ff]/15 text-[#58afff]"
                                        : "border-white/10 bg-white/[0.02] text-white/45 hover:text-white"
                                }`}
                            >
                                {m.is_featured
                                    ? "★ Featured"
                                    : "☆ Featured"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    updateMedia(m.id, {
                                        is_visible: !m.is_visible,
                                    })
                                }
                                className={`rounded-xl border px-3 py-2.5 text-xs font-black transition ${
                                    m.is_visible
                                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                                        : "border-white/10 bg-white/[0.02] text-white/35"
                                }`}
                            >
                                {m.is_visible
                                    ? "● Visible"
                                    : "○ Hidden"}
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    </>
)}

                {tab==="website"&&<><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-black">Website Editor</h1><p className="mt-2 text-white/45">Change content without touching code.</p></div><button onClick={saveSite} disabled={saving} className="rounded-xl bg-[#0088ff] px-5 py-3 font-black disabled:opacity-50"><Save className="mr-2 inline" size={17}/>{saving?"Saving...":"Save Changes"}</button></div>
                    <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d1118] p-6"><h2 className="text-lg font-black">Site Settings</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-white/45">SITE NAME<input className={`${input} mt-2 text-white`} value={settings.site_name} onChange={(e)=>setSettings({...settings,site_name:e.target.value})}/></label><label className="text-xs font-bold text-white/45">CONTACT EMAIL<input className={`${input} mt-2 text-white`} value={settings.contact_email} onChange={(e)=>setSettings({...settings,contact_email:e.target.value})}/></label><label className="text-xs font-bold text-white/45 md:col-span-2">TAGLINE<input className={`${input} mt-2 text-white`} value={settings.tagline} onChange={(e)=>setSettings({...settings,tagline:e.target.value})}/></label></div></section>
                    <div className="mt-8 flex items-center justify-between"><h2 className="text-xl font-black">Home Page Sections</h2><div className="flex gap-2"><button onClick={()=>addSection("text")} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"><Plus className="mr-1 inline" size={15}/>Text</button><button onClick={()=>addSection("cta")} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"><Plus className="mr-1 inline" size={15}/>CTA</button></div></div>
                    <div className="mt-4 space-y-4">{sections.map((s,i)=><article key={s.id} className="rounded-2xl border border-white/10 bg-[#0d1118] p-5"><div className="flex items-center gap-2"><span className="rounded-lg bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white/40">{s.section_type}</span><button onClick={()=>patchSection(s.id,{is_visible:!s.is_visible})} className="ml-auto rounded-lg p-2 hover:bg-white/5">{s.is_visible?<Eye size={17}/>:<EyeOff size={17}/>}</button><button onClick={()=>move(i,-1)} className="rounded-lg p-2 hover:bg-white/5"><ChevronUp size={17}/></button><button onClick={()=>move(i,1)} className="rounded-lg p-2 hover:bg-white/5"><ChevronDown size={17}/></button><button onClick={()=>removeSection(s.id)} className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={17}/></button></div><div className="mt-4 grid gap-3"><input className={input} placeholder="Section title" value={s.title} onChange={(e)=>patchSection(s.id,{title:e.target.value})}/><input className={input} placeholder="Small heading / subtitle" value={s.subtitle} onChange={(e)=>patchSection(s.id,{subtitle:e.target.value})}/><textarea className={`${input} min-h-24`} placeholder="Section text" value={s.body} onChange={(e)=>patchSection(s.id,{body:e.target.value})}/><input className={input} placeholder="Image URL (upload in Media Library, then paste here)" value={s.image_url||""} onChange={(e)=>patchSection(s.id,{image_url:e.target.value})}/>{s.section_type==="cta"&&<div className="grid gap-3 md:grid-cols-2"><input className={input} placeholder="Button label" value={s.button_label||""} onChange={(e)=>patchSection(s.id,{button_label:e.target.value})}/><input className={input} placeholder="Button link" value={s.button_href||""} onChange={(e)=>patchSection(s.id,{button_href:e.target.value})}/></div>}</div></article>)}</div>
                </>}
            </div>
        </main>
    </div>;
}
