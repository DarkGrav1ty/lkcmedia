import Link from "next/link";

const policyLinks = [
    ["/terms", "Terms"],
    ["/privacy", "Privacy"],
    [
        "/cancellation-rescheduling",
        "Cancellation / Rescheduling",
    ],
    ["/photo-usage", "Photo Usage"],
];

export default function PolicyLinks() {
    return (
        <footer className="border-t border-white/10 bg-[#07090d] px-5 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
                    <div>
                        <Link
                            href="/"
                            className="text-sm font-black uppercase tracking-[.18em] text-white/80 transition hover:text-white"
                        >
                            LKC Media
                        </Link>

                        <p className="mt-1 text-xs text-white/30">
                            © {new Date().getFullYear()} LKC Media. All rights reserved.
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

                <div className="mt-7 border-t border-white/10 pt-5">
                    <nav
                        aria-label="Policies"
                        className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[11px] text-white/35 md:justify-start"
                    >
                        {policyLinks.map(([href, label]) => (
                            <Link
                                key={href}
                                href={href}
                                className="transition hover:text-white"
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
