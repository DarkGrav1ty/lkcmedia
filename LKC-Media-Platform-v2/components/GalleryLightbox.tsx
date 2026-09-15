"use client";

import {
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState,
} from "react";

export type GalleryPhoto = {
    id: string;
    preview: string;
    title: string;
    aspect?: "landscape" | "portrait";
};

export default function GalleryLightbox({
    photos,
}: {
    photos: GalleryPhoto[];
}) {
    const [activeIndex, setActiveIndex] =
        useState<number | null>(null);

    const active =
        activeIndex !== null
            ? photos[activeIndex]
            : null;

    const close = useCallback(() => {
        setActiveIndex(null);
    }, []);

    const previous = useCallback(() => {
        if (
            activeIndex === null ||
            photos.length === 0
        ) {
            return;
        }

        setActiveIndex(
            activeIndex === 0
                ? photos.length - 1
                : activeIndex - 1
        );
    }, [activeIndex, photos.length]);

    const next = useCallback(() => {
        if (
            activeIndex === null ||
            photos.length === 0
        ) {
            return;
        }

        setActiveIndex(
            activeIndex === photos.length - 1
                ? 0
                : activeIndex + 1
        );
    }, [activeIndex, photos.length]);

    useEffect(() => {
        if (activeIndex === null) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                close();
            }

            if (event.key === "ArrowLeft") {
                previous();
            }

            if (event.key === "ArrowRight") {
                next();
            }
        }

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.body.style.overflow =
                originalOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        activeIndex,
        close,
        next,
        previous,
    ]);

    if (photos.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <p className="text-sm text-white/40">
                    No photos are currently published
                    in this gallery.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                {photos.map((photo, index) => (
                    <button
                        key={photo.id}
                        type="button"
                        onClick={() =>
                            setActiveIndex(index)
                        }
                        className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118] text-left"
                    >
                        <img
                            src={photo.preview}
                            alt={photo.title}
                            loading="lazy"
                            decoding="async"
                            className="h-auto w-full transition duration-500 group-hover:scale-[1.015]"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70 transition duration-300 group-hover:opacity-90" />

                        <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
                            <span className="-rotate-12 select-none whitespace-nowrap text-sm font-black tracking-[0.28em] text-white/15 sm:text-base">
                                LKC MEDIA • PREVIEW
                            </span>
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 pt-20">
                            <p className="truncate text-sm font-bold text-white/85">
                                {photo.title}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {active && activeIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${active.title} preview`}
                >
                    <button
                        type="button"
                        onClick={close}
                        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/60 text-white transition hover:bg-white/15 md:right-6 md:top-6"
                        aria-label="Close photo"
                    >
                        <X size={20} />
                    </button>

                    {photos.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={previous}
                                className="absolute left-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/60 text-white transition hover:bg-white/15 md:left-6"
                                aria-label="Previous photo"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                type="button"
                                onClick={next}
                                className="absolute right-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/60 text-white transition hover:bg-white/15 md:right-6"
                                aria-label="Next photo"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    <div className="flex h-full w-full items-center justify-center px-4 py-20 md:px-24">
                        <div className="relative flex max-h-full max-w-7xl items-center justify-center overflow-hidden rounded-xl bg-[#080a0e]">
                            <img
                                src={active.preview}
                                alt={active.title}
                                className="max-h-[82vh] max-w-full object-contain"
                            />

                            <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
                                <span className="-rotate-12 select-none whitespace-nowrap text-xl font-black tracking-[0.3em] text-white/15 md:text-4xl">
                                    LKC MEDIA • PREVIEW
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center">
                        <p className="text-sm font-bold text-white/70">
                            {active.title}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                            {activeIndex + 1} /{" "}
                            {photos.length}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}