"use client";

import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";

export type GalleryPhoto = {
    id: string;
    preview: string;
    title: string;
    price: number;
    aspect?: "landscape" | "portrait";
};

export default function GalleryLightbox({
    photos,
}: {
    photos: GalleryPhoto[];
}) {
    const [active, setActive] = useState<GalleryPhoto | null>(null);
    const [buying, setBuying] = useState(false);

    async function buyPhoto(photo: GalleryPhoto) {
        setBuying(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    photoId: photo.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error ?? "Checkout is not configured yet.");
                return;
            }

            window.location.href = data.url;
        } finally {
            setBuying(false);
        }
    }

    return (
        <>
            <div className="photo-grid">
                {photos.map((photo) => (
                    <button
                        key={photo.id}
                        onClick={() => setActive(photo)}
                        className="group relative w-full overflow-hidden rounded-2xl bg-[#0d1118] text-left"
                    >
                        <img
                            src={photo.preview}
                            alt={photo.title}
                            className="h-auto w-full transition duration-500 group-hover:scale-[1.015]"
                        />

                        <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <span className="-rotate-12 select-none text-lg font-black tracking-[0.28em] text-white/18">
                                LKC MEDIA • PREVIEW
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-20">
                            <div className="flex items-end justify-between gap-4">
                                <span className="font-bold">{photo.title}</span>
                                <span className="text-sm font-black text-[#3ca5ff]">
                                    ${photo.price}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {active && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 p-4 backdrop-blur-md md:p-8"
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        onClick={() => setActive(null)}
                        className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                        aria-label="Close"
                    >
                        <X />
                    </button>

                    <div className="mx-auto grid h-full max-w-7xl items-center gap-5 lg:grid-cols-[1fr_300px]">
                        <div className="relative flex max-h-[88vh] items-center justify-center overflow-hidden rounded-2xl bg-[#0a0c10]">
                            <img
                                src={active.preview}
                                alt={active.title}
                                className="max-h-[88vh] max-w-full object-contain"
                            />

                            <span className="pointer-events-none absolute -rotate-12 select-none text-2xl font-black tracking-[0.3em] text-white/18 md:text-4xl">
                                LKC MEDIA • PREVIEW
                            </span>
                        </div>

                        <aside className="rounded-2xl border border-white/10 bg-[#10151d] p-6">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0088ff]">
                                Digital Download
                            </p>

                            <h2 className="mt-3 text-2xl font-black">
                                {active.title}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-white/55">
                                Purchase the full-resolution, unwatermarked image.
                            </p>

                            <div className="my-7 h-px bg-white/10" />

                            <div className="flex items-end justify-between">
                                <span className="text-sm text-white/45">Single photo</span>
                                <strong className="text-3xl">${active.price}</strong>
                            </div>

                            <button
                                onClick={() => buyPhoto(active)}
                                disabled={buying}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0088ff] px-5 py-4 font-black transition hover:bg-[#0077df] disabled:opacity-50"
                            >
                                <ShoppingBag size={18} />
                                {buying ? "Opening..." : "Buy Photo"}
                            </button>
                        </aside>
                    </div>
                </div>
            )}
        </>
    );
}
