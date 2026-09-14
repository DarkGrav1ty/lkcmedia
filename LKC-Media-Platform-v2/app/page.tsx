import Link from "next/link";
import GalleryLightbox, { GalleryPhoto } from "@/components/GalleryLightbox";
import Pricing from "@/components/Pricing";
import BookingButton from "@/components/BookingButton";
import CMSSections from "@/components/CMSSections";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const featured: GalleryPhoto[] = [
    {
        id: "demo-1",
        preview: "/images/photo-1.jpg",
        title: "Game Night",
        price: 7,
    },
    {
        id: "demo-2",
        preview: "/images/photo-2.jpg",
        title: "Under The Lights",
        price: 5,
    },
    {
        id: "demo-3",
        preview: "/images/photo-3.jpg",
        title: "The Moment",
        price: 10,
    },
    {
        id: "demo-4",
        preview: "/images/photo-4.jpg",
        title: "Portrait",
        price: 7,
    },
    {
        id: "demo-5",
        preview: "/images/photo-5.jpg",
        title: "Sideline",
        price: 7,
    },
];

async function cms() {
    try {
        const db = getSupabaseAdmin();

        const [a, b] = await Promise.all([
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
        ]);

        return {
            settings: a.data,
            sections: b.data || [],
        };
    } catch {
        return {
            settings: null,
            sections: [],
        };
    }
}

export const dynamic = "force-dynamic";

export default async function Home() {
    const { settings, sections } = await cms();

    return (
        <main>

            {/* HERO */}
            <section className="relative min-h-[92vh] overflow-hidden pt-20">
                <img
                    src="/images/hero.jpg"
                    alt="LKC Media sports photography"
                    className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-transparent to-black/20" />

                <div className="relative mx-auto flex min-h-[calc(92vh-5rem)] max-w-[1500px] items-end px-5 pb-16 md:px-10 md:pb-24">
                    <div className="max-w-5xl">

                        <p className="mb-5 text-xs font-black uppercase tracking-[.3em] text-[#45a9ff]">
                            Sports + Portrait Photography
                        </p>

                        <h1 className="text-5xl font-black uppercase leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[7.5rem]">
                            More Than
                            <br />
                            A Game.
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-white/65 md:text-lg">
                            {settings?.tagline ||
                                "Real moments. Lasting memories. Photography with purpose."}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/gallery"
                                className="rounded-full bg-[#0088ff] px-6 py-3.5 font-black"
                            >
                                View Galleries
                            </Link>

                            <BookingButton className="rounded-full border border-white/20 bg-black/30 px-6 py-3.5 font-black backdrop-blur-sm">
                                Book a Shoot
                            </BookingButton>
                        </div>

                        <div className="mt-10 flex items-center gap-4 text-white/40">
                            <div className="h-px w-10 bg-[#0088ff]" />

                            <p className="text-xs font-bold uppercase tracking-[.22em]">
                                For His Glory
                            </p>
                        </div>

                    </div>
                </div>
            </section>


            {/* PURPOSE */}
            <section className="relative overflow-hidden border-y border-white/10 px-5 py-24 md:px-10 md:py-32">

                <div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.025]"
>
    {/* Vertical beam */}
    <div className="absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-white" />

    {/* Horizontal beam */}
    <div className="absolute left-0 top-[30%] h-16 w-full bg-white" />
</div>

                <div className="relative mx-auto max-w-5xl text-center">

                    <p className="text-xs font-black uppercase tracking-[.3em] text-[#0088ff]">
                        Purpose Behind The Lens
                    </p>

                    <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-black uppercase leading-[.95] tracking-[-.045em] md:text-7xl">
                        Created With Purpose.
                        <br />
                        <span className="text-white/35">
                            For His Glory.
                        </span>
                    </h2>

                    <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/55 md:text-lg">
                        My faith is an important part of who I am and how I approach
                        my work. I believe God gives each of us gifts for a purpose,
                        and photography is one of the ways I get to use mine.
                        Whether I&apos;m photographing an athlete under the lights
                        or creating a portrait, my goal is to serve people well,
                        create something meaningful, and give God the glory through
                        what I do.
                    </p>

                    <div className="mx-auto mt-12 h-px w-16 bg-[#0088ff]" />

                    <blockquote className="mx-auto mt-10 max-w-3xl">
                        <p className="text-xl font-bold leading-9 text-white/85 md:text-2xl">
                            &ldquo;Whatever you do, work at it with all your heart,
                            as working for the Lord.&rdquo;
                        </p>

                        <footer className="mt-5 text-xs font-black uppercase tracking-[.3em] text-[#45a9ff]">
                            Colossians 3:23
                        </footer>
                    </blockquote>

                </div>
            </section>


            {/* FEATURED WORK */}
            <section className="px-5 py-24 md:px-10">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-10 flex items-end justify-between gap-6">

                        <div>
                            <p className="text-xs font-black uppercase tracking-[.28em] text-[#0088ff]">
                                Featured
                            </p>

                            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-.04em] md:text-6xl">
                                Recent Work
                            </h2>
                        </div>

                        <Link
                            href="/gallery"
                            className="text-sm font-black text-white/55 transition hover:text-white"
                        >
                            All Galleries →
                        </Link>

                    </div>

                    <GalleryLightbox photos={featured} />

                </div>
            </section>


            {/* EXISTING CMS CONTENT */}
            <CMSSections sections={sections} />


{/* PRICING */}
            <Pricing />


            {/* VERSE OF THE DAY */}
            <section className="border-t border-white/10 px-5 py-20 md:px-10">
                <div className="mx-auto max-w-7xl">

                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1118] px-6 py-10 md:px-12 md:py-14">

                        {/* Subtle Cross */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute right-[-2rem] top-1/2 h-72 w-44 -translate-y-1/2 opacity-[0.025]"
                        >
                            <div className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 bg-white" />
                            <div className="absolute left-0 top-[30%] h-10 w-full bg-white" />
                        </div>

                        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                            <div className="max-w-3xl">

                                <p className="text-xs font-black uppercase tracking-[.3em] text-[#0088ff]">
                                    Daily Scripture
                                </p>

                                <h2 className="mt-4 text-3xl font-black uppercase tracking-[-.04em] md:text-5xl">
                                    Verse of the Day
                                </h2>

                                <p className="mt-5 max-w-2xl text-base leading-7 text-white/50">
                                    Take a moment in the middle of the day to get into
                                    God&apos;s Word. Read today&apos;s Verse of the Day
                                    with YouVersion.
                                </p>

                            </div>

                            <a
                                href="https://www.bible.com/verse-of-the-day"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#0088ff] px-7 py-4 font-black transition hover:bg-[#1994ff]"
                            >
                                Read Today&apos;s Verse →
                            </a>

                        </div>

                        <div className="relative mt-8 border-t border-white/10 pt-5">
                            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/25">
                                Read on YouVersion Bible
                            </p>
                        </div>

                    </div>
                </div>
            </section>


            {/* PHILIPPIANS */}
            <section className="border-t border-white/10 px-5 py-24 text-center md:px-10">

                <div className="mx-auto max-w-4xl">

                    <div className="mx-auto mb-9 flex h-14 w-14 items-center justify-center rounded-full border border-[#0088ff]/40 bg-[#0088ff]/5">
                        <span className="text-3xl font-light text-[#45a9ff]">
                            ✝
                        </span>
                    </div>

                    <p className="text-xs font-black uppercase tracking-[.3em] text-[#0088ff]">
                        Faith Over Fear
                    </p>

                    <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-black uppercase leading-[1] tracking-[-.045em] md:text-6xl">
                        I Can Do All Things
                        <br />
                        <span className="text-white/35">
                            Through Christ.
                        </span>
                    </h2>

                    <p className="mt-7 text-sm font-black uppercase tracking-[.3em] text-white/45">
                        Philippians 4:13
                    </p>

                </div>
            </section>


            {/* BOOKING */}
            <section
                id="book"
                className="border-t border-white/10 px-5 py-28 text-center md:px-10"
            >
                <div className="mx-auto max-w-3xl">

                    <p className="text-xs font-black uppercase tracking-[.28em] text-[#0088ff]">
                        Booking
                    </p>

                    <h2 className="mt-4 text-5xl font-black uppercase tracking-[-.05em] md:text-7xl">
                        Let&apos;s Create Something.
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl leading-7 text-white/50">
                        Tell me about the game, portrait session, date, and location.
                        Let&apos;s turn the moment into something worth remembering.
                    </p>

                    <BookingButton className="mt-8 inline-block rounded-full bg-[#0088ff] px-7 py-4 font-black">
                        Book a Shoot
                    </BookingButton>

                </div>
            </section>


            {/* FOOTER */}
            <footer className="border-t border-white/10 px-5 py-10">

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">

                    <div>
                        <p className="text-sm font-black uppercase tracking-[.18em] text-white/80">
                            {settings?.site_name || "LKC Media"}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                            © 2026 LKC Media. All rights reserved.
                        </p>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-xs font-black uppercase tracking-[.24em] text-[#45a9ff]">
                            For His Glory.
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[.2em] text-white/25">
                            Colossians 3:23
                        </p>
                    </div>

                </div>

            </footer>

        </main>
    );
}