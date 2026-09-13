import Link from "next/link";
import BookingButton from "@/components/BookingButton";

export default function Header() {
    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#07090d]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-10">
                <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
                    <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xs">
                        LKC
                    </span>
                    <span>LKC MEDIA</span>
                </Link>

                <nav className="flex items-center gap-5 text-sm font-bold text-white/65 md:gap-8">
                    <Link className="transition hover:text-white" href="/gallery">
                        Galleries
                    </Link>
                    <Link className="hidden transition hover:text-white sm:block" href="/#pricing">
                        Pricing
                    </Link>
                    <BookingButton
                        className="rounded-full bg-[#0088ff] px-4 py-2.5 text-white transition hover:bg-[#0077df]"
                    >
                        Book a Shoot
                    </BookingButton>
                </nav>
            </div>
        </header>
    );
}
