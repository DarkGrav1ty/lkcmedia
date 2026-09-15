import Link from "next/link";
import Pricing from "@/components/Pricing";
import BookingButton from "@/components/BookingButton";
import DailyVerse from "@/components/DailyVerse";

export const dynamic = "force-static";

export default function Home() {
    return (
        <main>
            {/* HERO */}
            <section className="relative min-h-[82vh] overflow-hidden pt-20 md:min-h-[88vh]">
                <div className="absolute inset-0">
                    <img
                        src="/images/hero.jpg"
                        alt="Football team gathered together on the field"
                        fetchPriority="high"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full select-none object-cover object-center"
                    />
                </div>

                {/* Readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07090d]/90 via-transparent to-black/10" />

                {/* Content */}
                <div className="relative mx-auto flex min-h-[calc(82vh-5rem)] max-w-[1500px] items-end px-5 pb-14 md:min-h-[calc(88vh-5rem)] md:px-10 md:pb-20">
                    <div className="max-w-4xl">
                        <p className="mb-5 text-xs font-black uppercase tracking-[.3em] text-[#45a9ff]">
                            Sports + Portrait Photography
                        </p>

                        <h1 className="text-5xl font-black uppercase leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[7rem]">
                            More Than
                            <br />
                            A Game.
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-white/75 md:text-lg">
                            Real moments. Lasting memories.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/gallery"
                                className="rounded-full bg-[#0088ff] px-6 py-3.5 font-black transition hover:bg-[#0077df]"
                            >
                                View Galleries
                            </Link>

                            <BookingButton className="rounded-full border border-white/30 bg-black/35 px-6 py-3.5 font-black backdrop-blur-md transition hover:border-white/60 hover:bg-black/55">
                                Book A Session
                            </BookingButton>
                        </div>

                        <div className="mt-10 flex items-center gap-4 text-white/45">
                            <div className="h-px w-10 bg-[#0088ff]" />

                            <p className="text-xs font-bold uppercase tracking-[.22em]">
                                LKC Media Â· Arizona
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PURPOSE â€” PRESERVED */}
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
                                For His Glory Â· Colossians 3:23
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
                            All Galleries &rarr;
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
                        <p className="text-sm text-white/40">
                            View the latest published work in Galleries.
                        </p>

                        <Link
                            href="/gallery"
                            className="mt-5 inline-block rounded-full border border-white/15 px-5 py-2.5 text-sm font-black transition hover:border-white/40"
                        >
                            View Galleries
                        </Link>
                    </div>
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
                        Tell me about the game, portrait session, date,
                        and location. Let&apos;s turn the moment into
                        something worth remembering.
                    </p>

                    <BookingButton className="mt-8 inline-block rounded-full bg-[#0088ff] px-7 py-4 font-black transition hover:bg-[#0077df]">
                        Book Session
                    </BookingButton>
                </div>
            </section>
        </main>
    );
}


