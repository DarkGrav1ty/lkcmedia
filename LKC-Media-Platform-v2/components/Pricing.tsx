const packages = [
    ["5 Edited Photos", "$10"],
    ["10 Edited Photos", "$25"],
    ["20 Edited Photos", "$45"],
    ["30 Edited Photos", "$55"],
];

export default function Pricing() {
    return (
        <section id="pricing" className="border-t border-white/10 px-5 py-24 md:px-10">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                    Pricing
                </p>

                <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <h2 className="max-w-3xl text-4xl font-black uppercase tracking-[-0.04em] md:text-6xl">
                        Simple photo packages.
                    </h2>

                    <p className="max-w-sm text-white/50">
                        High-quality, professionally edited photos delivered in 1–5 days.
                    </p>
                </div>

                <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {packages.map(([name, price]) => (
                        <div
                            key={name}
                            className="rounded-2xl border border-white/10 bg-[#0d1118] p-6"
                        >
                            <p className="text-white/55">{name}</p>
                            <p className="mt-8 text-4xl font-black">{price}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#0088ff]/35 bg-[#0088ff]/8 p-7">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#3ca5ff]">
                            Team / Event
                        </p>
                        <div className="mt-3 flex items-end justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black">Full Game Coverage</h3>
                                <p className="mt-2 text-sm text-white/50">
                                    All best edited photos for teams, programs, and events.
                                </p>
                            </div>
                            <strong className="text-4xl">$90</strong>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-7">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                            Travel
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-white/55">Within 20 minutes</span><strong className="text-right">$0</strong>
                            <span className="text-white/55">20–45 minutes</span><strong className="text-right">+$10</strong>
                            <span className="text-white/55">45–60 minutes</span><strong className="text-right">+$20</strong>
                            <span className="text-white/55">60+ minutes</span><strong className="text-right">Contact</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
