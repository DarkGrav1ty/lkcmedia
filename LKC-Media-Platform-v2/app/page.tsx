import Link from "next/link";
import GalleryLightbox, {
    GalleryPhoto,
} from "@/components/GalleryLightbox";
import Pricing from "@/components/Pricing";
import BookingButton from "@/components/BookingButton";
import DailyVerse from "@/components/DailyVerse";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type MediaAsset = {
    id: string;
    file_name: string;
    public_url: string;
    gallery: "sports" | "portraits";
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
};

async function cms() {
    try {
        const db = getSupabaseAdmin();

        const [
            settingsResult,
            featuredResult,
        ] = await Promise.all([
            db
                .from("site_settings")
                .select("*")
                .eq("id", "main")
                .single(),

            db
                .from("media_assets")
                .select(
                    "id, file_name, public_url, gallery, is_featured, is_visible, sort_order, created_at"
                )
                .eq("is_featured", true)
                .eq("is_visible", true)
                .order("sort_order", {
                    ascending: true,
                })
                .order("created_at", {
                    ascending: false,
                }),
        ]);

        if (featuredResult.error) {
            console.error(
                "Could not load featured media:",
                featuredResult.error.message
            );
        }

        const featuredMedia =
            (featuredResult.data || []) as MediaAsset[];

        const featured: GalleryPhoto[] =
            featuredMedia.map((photo) => ({
                id: photo.id,
                preview: photo.public_url,
                title: photo.file_name.replace(
                    /\.[^/.]+$/,
                    ""
                ),
                price: 0,
            }));

        return {
            settings: settingsResult.data,
            featured,
            heroMedia: featuredMedia.slice(0, 3),
        };
    } catch (error) {
        console.error(
            "Homepage CMS error:",
            error
        );

        return {
            settings: null,
            featured: [] as GalleryPhoto[],
            heroMedia: [] as MediaAsset[],
        };
    }
}

export const dynamic = "force-dynamic";

export default async function Home() {
    const {
        settings,
        featured,
        heroMedia,
    } = await cms();

    const primaryHero =
        heroMedia[0]?.public_url ||
        "/images/hero.jpg";

    const secondaryHero =
        heroMedia[1]?.public_url ||
        primaryHero;

    const tertiaryHero =
        heroMedia[2]?.public_url ||
        secondaryHero;

    return (
        <main>
            {/* HERO */}
            <section className="relative min-h-[92vh] overflow-hidden pt-20">
                {/* Mobile Hero */}
                <div className="absolute inset-0 md:hidden">
                    <img
                        src={primaryHero}
                        alt="LKC Media featured photography"
                        className="h-full w-full object-cover object-[center_22%]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-transparent to-black/20" />
                </div>

                {/* Desktop Split Hero */}
                <div className="absolute inset-0 hidden md:grid md:grid-cols-[1.45fr_.55fr]">
                    <div className="relative overflow-hidden">
                        <img
                            src={primaryHero}
                            alt="LKC Media featured sports photography"
                            className="h-full w-full object-cover object-[center_22%]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
                    </div>

                    <div className="grid grid-rows-2 gap-1 bg-[#07090d] pl-1">
                        <div className="relative overflow-hidden">
                            <img
                                src={secondaryHero}
                                alt="LKC Media featured photography"
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/15" />
                        </div>

                        <div className="relative overflow-hidden">
                            <img
                                src={tertiaryHero}
                                alt="LKC Media featured photography"
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/15" />
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07090d] via-transparent to-black/20" />

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
                                "Real moments. Lasting memories."}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/#work"
                                className="rounded-full bg-[#0088ff] px-6 py-3.5 font-black transition hover:bg-[#0077df]"
                            >
                                View Work
                            </Link>

                            <BookingButton className="rounded-full border border-white/25 bg-black/40 px-6 py-3.5 font-black backdrop-blur-sm transition hover:border-white/50 hover:bg-black/60">
                                Book Session
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

            {/* PURPOSE — PRESERVED */}
            <section className="relative overflow-hidden border-y border-white/10 px-5 py-24 md:px-10 md:py-32">
                <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[.3em] text-[#0088ff]">
                            Behind The Lens
                        </p>

                        <h2 className="mt-5 text-4xl font-black uppercase leading-[.95] tracking-[-.045em] md:text-6xl">
                            Photography
                            <br />

                            <span className="text-white/35">
                                With Purpose.
                            </span>
                        </h2>
                    </div>

                    <div>
                        <p className="text-base leading-8 text-white/60 md:text-lg">
                            I&apos;m Logan, the photographer behind LKC Media.
                            I started shooting in 2025, focusing on sports
                            and portraits and the moments people want to
                            remember.
                        </p>

                        <p className="mt-5 text-base leading-8 text-white/50">
                            My faith is an important part of who I am and
                            shaped how I approach my work: serve people
                            well, work with purpose, and give my best to
                            every shoot. LKC Media is for everyone,
                            regardless of background or belief.
                        </p>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-px w-10 bg-[#0088ff]" />

                            <p className="text-xs font-bold uppercase tracking-[.22em] text-white/35">
                                For His Glory · Colossians 3:23
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED WORK */}
            <section
                id="work"
                className="scroll-mt-20 px-5 py-24 md:px-10"
            >
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

                    {featured.length > 0 ? (
                        <GalleryLightbox
                            photos={featured}
                        />
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
                            <p className="text-sm text-white/40">
                                No featured work is currently published.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* PRICING */}
            <Pricing />

            {/* DAILY SCRIPTURE */}
            <DailyVerse />

            {/* BOOKING */}
            <section
                id="book"
                className="scroll-mt-20 border-t border-white/10 px-5 py-28 text-center md:px-10"
            >
                <div className="mx-auto max-w-3xl">
                    <p className="text-xs font-black uppercase tracking-[.28em] text-[#0088ff]">
                        Booking
                    </p>

                    <h2 className="mt-4 text-5xl font-black uppercase tracking-[-.05em] md:text-7xl">
                        Let&apos;s Create Something.
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl leading-7 text-white/50">
                        Tell me about the game, portrait session,
                        date, and location. Let&apos;s turn the
                        moment into something worth remembering.
                    </p>

                    <BookingButton className="mt-8 inline-block rounded-full bg-[#0088ff] px-7 py-4 font-black transition hover:bg-[#0077df]">
                        Book Session
                    </BookingButton>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 px-5 py-10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[.18em] text-white/80">
                            {settings?.site_name ||
                                "LKC Media"}
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