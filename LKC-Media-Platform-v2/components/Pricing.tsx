const packages = [
    {
        name: "5 Edited Photos",
        price: "$10",
        description: "A quick set of professionally edited photos.",
        popular: false,
    },
    {
        name: "10 Edited Photos",
        price: "$25",
        description: "More coverage with a larger selection of finished images.",
        popular: true,
    },
    {
        name: "20 Edited Photos",
        price: "$45",
        description: "Extended coverage with more moments from the session.",
        popular: false,
    },
    {
        name: "30 Edited Photos",
        price: "$55",
        description: "The largest individual package for maximum coverage.",
        popular: false,
    },
];

export default function Pricing() {
    return (
        <section
            id="pricing"
            className="scroll-mt-20 border-t border-white/10 px-5 py-24 md:px-10"
        >
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                    Pricing
                </p>

                <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <h2 className="max-w-3xl text-4xl font-black uppercase tracking-[-0.04em] md:text-6xl">
                        Simple photo packages.
                    </h2>

                    <div className="max-w-sm md:text-right">
                        <p className="text-white/50">
                            High-quality, professionally edited photos.
                        </p>

                        <p className="mt-2 text-sm font-bold text-white/75">
                            Typical delivery: 1–5 days.
                        </p>
                    </div>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {packages.map((photoPackage) => (
                        <div
                            key={photoPackage.name}
                            className={`relative flex min-h-[260px] flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${
                                photoPackage.popular
                                    ? "border-[#0088ff]/70 bg-[#0088ff]/10 shadow-[0_0_40px_rgba(0,136,255,0.08)]"
                                    : "border-white/10 bg-[#0d1118]"
                            }`}
                        >
                            {photoPackage.popular && (
                                <div className="absolute right-4 top-4 rounded-full bg-[#0088ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white">
                                    Most Popular
                                </div>
                            )}

                            <p className="pr-20 text-sm font-bold text-white/70">
                                {photoPackage.name}
                            </p>

                            <p className="mt-5 text-sm leading-6 text-white/40">
                                {photoPackage.description}
                            </p>

                            <div className="mt-auto pt-8">
                                <p className="text-4xl font-black">
                                    {photoPackage.price}
                                </p>

                                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/30">
                                    1–5 Day Delivery
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#0088ff]/35 bg-[#0088ff]/8 p-7">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#3ca5ff]">
                            Team / Event
                        </p>

                        <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <h3 className="text-2xl font-black">
                                    Full Game Coverage
                                </h3>

                                <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
                                    All best edited photos for teams,
                                    programs, and events.
                                </p>

                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-white/30">
                                    1–5 Day Delivery
                                </p>
                            </div>

                            <strong className="text-4xl">
                                Contact
                            </strong>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-7">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                            Travel
                        </p>

                        <h3 className="mt-3 text-2xl font-black">
                            Travel Rates
                        </h3>

                        <div className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-white/55">
                                Within 20 minutes
                            </span>

                            <strong className="text-right">
                                $0
                            </strong>

                            <span className="text-white/55">
                                20–45 minutes
                            </span>

                            <strong className="text-right">
                                +$10
                            </strong>

                            <span className="text-white/55">
                                45–60 minutes
                            </span>

                            <strong className="text-right">
                                +$20
                            </strong>

                            <span className="text-white/55">
                                60+ minutes
                            </span>

                            <strong className="text-right">
                                Contact
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}