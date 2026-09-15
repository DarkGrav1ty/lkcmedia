"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { galleryCoverUrl } from "@/lib/public-image";

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

type GalleryFilter = "all" | "sports" | "portraits";

const galleryFilters: {
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

function formatDate(value: string | null) {
  if (!value) {
    return "LKC MEDIA";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "LKC MEDIA";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function GalleryBrowser({ albums }: { albums: PublicAlbum[] }) {
  const [activeGallery, setActiveGallery] = useState<GalleryFilter>("all");

  const [activeSport, setActiveSport] = useState("all");

  const availableSports = useMemo(() => {
    const values = new Set<string>();

    albums.forEach((album) => {
      if (album.gallery !== "sports") {
        return;
      }

      album.sports.forEach((sport) => {
        const clean = sport.trim();

        if (clean) {
          values.add(clean);
        }
      });
    });

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      if (activeGallery === "portraits") {
        return album.gallery === "portraits";
      }

      if (activeGallery === "sports") {
        if (album.gallery !== "sports") {
          return false;
        }

        if (activeSport === "all") {
          return true;
        }

        return album.sports.some((sport) => sport === activeSport);
      }

      return true;
    });
  }, [activeGallery, activeSport, albums]);

  function selectGallery(value: GalleryFilter) {
    setActiveGallery(value);

    if (value !== "sports") {
      setActiveSport("all");
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-2">
        {galleryFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={activeGallery === filter.value}
            onClick={() => selectGallery(filter.value)}
            className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
              activeGallery === filter.value
                ? "bg-[#0088ff] text-white"
                : "border border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {activeGallery === "sports" && availableSports.length > 0 && (
        <div className="mt-5 max-w-xs">
          <label
            htmlFor="sport-filter"
            className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35"
          >
            Sport
          </label>

          <select
            id="sport-filter"
            value={activeSport}
            onChange={(e) => setActiveSport(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0d1118] px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#0088ff]"
          >
            <option value="all">All Sports</option>

            {availableSports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredAlbums.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {filteredAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.slug}`}
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]"
            >
              {album.cover_url ? (
                <img
                  src={galleryCoverUrl(album.cover_url)}
                  alt={album.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-white/15">
                    LKC Media
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute left-5 top-5 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
                  {album.gallery}
                </span>

                {album.gallery === "sports" &&
                  album.sports.slice(0, 2).map((sport) => (
                    <span
                      key={sport}
                      className="rounded-full border border-[#0088ff]/30 bg-[#0088ff]/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#58afff] backdrop-blur-md"
                    >
                      {sport}
                    </span>
                  ))}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#45a9ff]">
                  {formatDate(album.event_date)}
                </p>

                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                  <h2 className="break-words text-xl font-black uppercase leading-tight md:text-3xl">
                    {album.name}
                  </h2>

                  <p className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                    {album.photo_count}{" "}
                    {album.photo_count === 1 ? "Photo" : "Photos"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
          <p className="font-bold text-white/55">Nothing here yet.</p>

          <p className="mt-2 text-sm text-white/30">
            No published galleries match this filter.
          </p>
        </div>
      )}
    </div>
  );
}
