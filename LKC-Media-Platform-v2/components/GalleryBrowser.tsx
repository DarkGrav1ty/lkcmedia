"use client";

import Link from "next/link";
import {
    useMemo,
    useState,
} from "react";

export type PublicAlbum = {
    id: string;
    name: string;
    slug: string;
    gallery: "sports" | "portraits";
    event_date: string | null;
    cover_url: string | null;
    photo_count: number;
    sports: string[];
};

type GalleryFilter =
    | "all"
    | "sports"
    | "portraits";

export default function GalleryBrowser({
    albums,
}: {
    albums: PublicAlbum[];
}) {
    const [
        activeGallery,
        setActiveGallery,
    ] = useState<GalleryFilter>("all");

    const [
        activeSport,
        setActiveSport,
    ] = useState("all");

    const availableSports =
        useMemo(() => {
            const sports = new Set<string>();

            albums.forEach((album) => {
                if (
                    album.gallery !==
                    "sports"
                ) {
                    return;
                }

                album.sports.forEach(
                    (sport) => {
                        if (sport.trim()) {
                            sports.add(
                                sport.trim()
                            );
                        }
                    }
                );
            });

            return Array.from(
                sports
            ).sort((a, b) =>
                a.localeCompare(b)
            );
        }, [albums]);

    const filteredAlbums =
        useMemo(() => {
            return albums.filter(
                (album) => {
                    if (
                        activeGallery ===
                        "portraits"
                    ) {
                        return (
                            album.gallery ===
                            "portraits"
                        );
                    }

                    if (
                        activeGallery ===
                        "sports"
                    ) {
                        if (
                            album.gallery !==
                            "sports"
                        ) {
                            return false;
                        }

                        if (
                            activeSport ===
                            "all"
                        ) {
                            return true;
                        }

                        return album.sports.includes(
                            activeSport
                        );
                    }

                    return true;
                }
            );
        }, [
            activeGallery,
            activeSport,
            albums,
        ]);

    function changeGallery(
        gallery: GalleryFilter
    ) {
        setActiveGallery(gallery);

        if (gallery !== "sports") {
            setActiveSport("all");
        }
    }

    function formatDate(
        date: string | null
    ) {
        if (!date) {
            return "LKC MEDIA";
        }

        const parsed = new Date(
            `${date}T12:00:00`
        );

        return new Intl.DateTimeFormat(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
            }
        ).format(parsed);
    }

    const filters: {
        value: GalleryFilter;
        label: string;
    }[] = [
        {
            value: "all",
            label: "All",
        },
        {
            value: "sports",
            label: "Sports",
        },
        {
            value: "portraits",
            label: "Portraits",
        },
    ];

    return (
        <>
            <div className="mt-8 flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() =>
                            changeGallery(
                                filter.value
                            )
                        }
                        className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                            activeGallery ===
                            filter.value
                                ? "bg-[#0088ff] text-white"
                                : "border border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {activeGallery ===
                "sports" &&
                availableSports.length >
                    0 && (
                    <div className="mt-5 flex flex-col gap-2 sm:max-w-sm">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                            Sport
                        </label>

                        <select
                            value={
                                activeSport
                            }
                            onChange={(e) =>
                                setActiveSport(
                                    e.target
                                        .value
                                )
                            }
                            className="rounded-xl border border-white/10 bg-[#0d1118] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-[#0088ff]"
                        >
                            <option value="all">
                                All Sports
                            </option>

                            {availableSports.map(
                                (sport) => (
                                    <option
                                        key={
                                            sport
                                        }
                                        value={
                                            sport
                                        }
                                    >
                                        {
                                            sport
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                )}

            {filteredAlbums.length >
            0 ? (
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {filteredAlbums.map(
                        (album) => (
                            <Link
                                key={album.id}
                                href={`/gallery/${album.slug}`}
                                className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]"
                            >
                                {album.cover_url ? (
                                    <img
                                        src={
                                            album.cover_url
                                        }
                                        alt={
                                            album.name
                                        }
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 grid place-items-center bg-[#0d1118]">
                                        <span className="text-xs font-black uppercase tracking-[0.25em] text-white/15">
                                            LKC
                                            Media
                                        </span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />

                                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
                                        {
                                            album.gallery
                                        }
                                    </span>

                                    {album.gallery ===
                                        "sports" &&
                                        album
                                            .sports[0] && (
                                            <span className="rounded-full border border-[#0088ff]/30 bg-[#0088ff]/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#58afff] backdrop-blur-md">
                                                {
                                                    album
                                                        .sports[0]
                                                }
                                            </span>
                                        )}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <div className="flex items-end justify-between gap-5">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#45a9ff]">
                                                {formatDate(
                                                    album.event_date
                                                )}
                                            </p>

                                            <h2 className="mt-2 text-2xl font-black uppercase md:text-3xl">
                                                {
                                                    album.name
                                                }
                                            </h2>
                                        </div>

                                        <p className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                                            {
                                                album.photo_count
                                            }{" "}
                                            {album.photo_count ===
                                            1
                                                ? "Photo"
                                                : "Photos"}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            ) : (
                <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                    <p className="text-sm text-white/40">
                        No published galleries
                        match this filter yet.
                    </p>
                </div>
            )}
        </>
    );
}