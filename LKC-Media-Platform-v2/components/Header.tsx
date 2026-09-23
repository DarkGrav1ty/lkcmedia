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
                    <img
                        src="/logo/lkc-logo.png"
                        alt="LKC Media logo"
                        className="h-10 w-10 object-contain"
                    />

                    <span className="hidden sm:inline">
                        LKC MEDIA
                    </span>
                </Link>

                <nav
                    aria-label="Main navigation"
                    className="flex items-center gap-3.5 text-xs font-bold text-white/60 sm:gap-6 sm:text-sm md:gap-7"
                >
                    <Link
                        href="/#work"
                        className="hidden transition hover:text-white sm:block"
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
                        href="/#pricing"
                        className="transition hover:text-white"
                    >
                        Pricing
                    </Link>

                    <BookingButton className="rounded-full bg-[#0088ff] px-3.5 py-2 font-black text-white transition hover:bg-[#0077df] sm:px-4 sm:py-2.5">
                        Book Session
                    </BookingButton>
                </nav>
            </div>
        </header>
    );
}
