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
import {
    galleryLightboxUrl,
    galleryThumbnailUrl,
} from "@/lib/public-image";

export type GalleryPhoto = {
    id: string;
    preview: string;
    title: string;
    aspect?: "landscape" | "portrait";
};

function Watermark({
    large = false,
}: {
    large?: boolean;
}) {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            aria-hidden="true"
        >
            <div className="absolute inset-0 flex -rotate-12 flex-col items-center justify-center gap-12 opacity-[0.16] md:gap-20">
                {Array.from({
                    length: large ? 5 : 4,
                }).map((_, row) => (
                    <div
                        key={row}
                        className="flex w-[180%] items-center justify-center gap-16 whitespace-nowrap md:gap-28"
                    >
                        {Array.from({
                            length: large ? 4 : 3,
                        }).map(
                            (_, column) => (
                                <span
                                    key={
                                        column
                                    }
                                    className={`select-none font-black uppercase tracking-[0.24em] text-white ${
                                        large
                                            ? "text-base sm:text-xl md:text-2xl"
                                            : "text-[9px] sm:text-xs"
                                    }`}
                                >
                                    LKC MEDIA
                                </span>
                            )
                        )}
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 grid place-items-center">
                <div
                    className={`select-none rounded-full border border-white/20 bg-black/15 font-black uppercase tracking-[0.28em] text-white/30 backdrop-blur-[1px] ${
                        large
                            ? "px-6 py-3 text-xs sm:text-sm"
                            : "px-4 py-2 text-[8px] sm:text-[10px]"
                    }`}
                >
                    LKC Media • Preview
                </div>
            </div>
        </div>
    );
}

export default function GalleryLightbox({
    photos,
}: {
    photos: GalleryPhoto[];
}) {
    const [
        activeIndex,
        setActiveIndex,
    ] = useState<number | null>(
        null
    );

    const active =
        activeIndex !== null
            ? photos[activeIndex]
            : null;

    const close =
        useCallback(() => {
            setActiveIndex(null);
        }, []);

    const previous =
        useCallback(() => {
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
        }, [
            activeIndex,
            photos.length,
        ]);

    const next =
        useCallback(() => {
            if (
                activeIndex === null ||
                photos.length === 0
            ) {
                return;
            }

            setActiveIndex(
                activeIndex ===
                    photos.length - 1
                    ? 0
                    : activeIndex + 1
            );
        }, [
            activeIndex,
            photos.length,
        ]);

    useEffect(() => {
        if (
            activeIndex === null
        ) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (
                event.key ===
                "Escape"
            ) {
                close();
            }

            if (
                event.key ===
                "ArrowLeft"
            ) {
                previous();
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                next();
            }
        }

        const originalOverflow =
            document.body.style
                .overflow;

        document.body.style.overflow =
            "hidden";

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

    useEffect(() => {
        if (
            activeIndex === null ||
            photos.length < 2
        ) {
            return;
        }

        const previousIndex =
            activeIndex === 0
                ? photos.length - 1
                : activeIndex - 1;

        const nextIndex =
            activeIndex ===
            photos.length - 1
                ? 0
                : activeIndex + 1;

        const urls = new Set([
            galleryLightboxUrl(
                photos[
                    previousIndex
                ].preview
            ),
            galleryLightboxUrl(
                photos[
                    nextIndex
                ].preview
            ),
        ]);

        urls.forEach((url) => {
            const image =
                new Image();

            image.decoding =
                "async";

            image.src = url;
        });
    }, [
        activeIndex,
        photos,
    ]);

    if (
        photos.length === 0
    ) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <p className="text-sm text-white/40">
                    No photos are currently
                    published in this gallery.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                {photos.map(
                    (
                        photo,
                        index
                    ) => (
                        <button
                            key={
                                photo.id
                            }
                            type="button"
                            onClick={() =>
                                setActiveIndex(
                                    index
                                )
                            }
                            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118] text-left"
                            aria-label={`Open ${photo.title}`}
                        >
                            <img
                                src={galleryThumbnailUrl(
                                    photo.preview
                                )}
                                alt={
                                    photo.title
                                }
                                loading={
                                    index <
                                    3
                                        ? "eager"
                                        : "lazy"
                                }
                                fetchPriority={
                                    index ===
                                    0
                                        ? "high"
                                        : "auto"
                                }
                                decoding="async"
                                draggable={
                                    false
                                }
                                className="h-auto w-full select-none transition duration-500 group-hover:scale-[1.015]"
                            />

                            <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/70 via-transparent to-black/5 opacity-75 transition duration-300 group-hover:opacity-90" />

                            <Watermark />

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 pt-20">
                                <p className="truncate text-sm font-bold text-white/85">
                                    {
                                        photo.title
                                    }
                                </p>
                            </div>
                        </button>
                    )
                )}
            </div>

            {active &&
                activeIndex !==
                    null && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${active.title} preview`}
                    >
                        <button
                            type="button"
                            onClick={
                                close
                            }
                            className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/70 text-white transition hover:bg-white/15 md:right-6 md:top-6"
                            aria-label="Close photo"
                        >
                            <X
                                size={
                                    20
                                }
                            />
                        </button>

                        {photos.length >
                            1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={
                                        previous
                                    }
                                    className="absolute left-3 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/70 text-white transition hover:bg-white/15 md:left-6"
                                    aria-label="Previous photo"
                                >
                                    <ChevronLeft
                                        size={
                                            24
                                        }
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        next
                                    }
                                    className="absolute right-3 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/70 text-white transition hover:bg-white/15 md:right-6"
                                    aria-label="Next photo"
                                >
                                    <ChevronRight
                                        size={
                                            24
                                        }
                                    />
                                </button>
                            </>
                        )}

                        <div className="flex h-full w-full items-center justify-center px-4 py-20 md:px-24">
                            <div className="relative flex max-h-full max-w-7xl items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#080a0e] shadow-2xl">
                                <img
                                    key={
                                        active.id
                                    }
                                    src={galleryLightboxUrl(
                                        active.preview
                                    )}
                                    alt={
                                        active.title
                                    }
                                    decoding="async"
                                    draggable={
                                        false
                                    }
                                    className="max-h-[82vh] max-w-full select-none object-contain"
                                />

                                <Watermark
                                    large
                                />
                            </div>
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-30 px-20 text-center">
                            <p className="truncate text-sm font-bold text-white/70">
                                {
                                    active.title
                                }
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                                {activeIndex +
                                    1}{" "}
                                /{" "}
                                {
                                    photos.length
                                }
                            </p>
                        </div>
                    </div>
                )}
        </>
    );
}