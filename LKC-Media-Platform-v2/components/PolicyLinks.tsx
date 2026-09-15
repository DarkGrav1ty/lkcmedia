import Link from "next/link";

const exploreLinks = [
    ["/gallery", "Galleries"],
    ["/services", "Photography Services"],
    ["/services/sports-photography", "Sports Photography"],
    ["/services/portrait-photography", "Portrait Photography"],
];

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
        <footer className="border-t border-white/10 bg-[#07090d]">
            <div className="mx-auto max-w-7xl px-5 py-10">
                <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
                    <div className="max-w-sm text-center md:text-left">
                        <Link
                            href="/"
                            className="font-black tracking-tight text-white"
                        >
                            LKC MEDIA
                        </Link>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                            Sports and portrait photography
                            in Arizona.
                        </p>

                        <p className="mt-2 text-sm text-white/30">
                            Real moments. Lasting memories.
                        </p>
                    </div>

                    <nav
                        aria-label="Explore LKC Media"
                        className="flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-300 md:justify-end"
                    >
                        {exploreLinks.map(
                            ([href, label]) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="transition hover:text-white"
                                >
                                    {label}
                                </Link>
                            ),
                        )}
                    </nav>
                </div>

                <div className="mt-8 border-t border-white/10 pt-7">
                    <nav
                        aria-label="Policies"
                        className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-white/40 md:justify-start"
                    >
                        {policyLinks.map(
                            ([href, label]) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="transition hover:text-white"
                                >
                                    {label}
                                </Link>
                            ),
                        )}
                    </nav>

                    <p className="mt-6 text-center text-xs text-white/25 md:text-left">
                        © {new Date().getFullYear()} LKC Media.
                        All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}