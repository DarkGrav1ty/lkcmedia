import Link from "next/link";
import BookingButton from "@/components/BookingButton";

export default function Header() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07090d]/95 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-10">
                <Link
                    href="/"
                    className="group flex items-center gap-3 font-black tracking-tight"
                    aria-label="LKC Media home"
                >
                    <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xs transition group-hover:border-[#0088ff] group-hover:text-[#45a9ff]">
                        LKC
                    </span>

                    <span className="hidden sm:inline">
                        LKC MEDIA
                    </span>
                </Link>

                <nav
                    aria-label="Main navigation"
                    className="flex items-center gap-4 text-sm font-bold text-white/60 md:gap-7"
                >
                    <Link
                        href="/#work"
                        className="hidden transition hover:text-white lg:block"
                    >
                        Work
                    </Link>

                    <Link
                        href="/gallery"
                        className="transition hover:text-white"
                    >
                        Galleries
                    </Link>

                    <Link
                        href="/services"
                        className="hidden transition hover:text-white sm:block"
                    >
                        Services
                    </Link>

                    <Link
                        href="/#pricing"
                        className="hidden transition hover:text-white lg:block"
                    >
                        Pricing
                    </Link>

                    <BookingButton className="rounded-full bg-[#0088ff] px-4 py-2.5 font-black text-white transition hover:bg-[#0077df]">
                        Book Session
                    </BookingButton>
                </nav>
            </div>
        </header>
    );
}