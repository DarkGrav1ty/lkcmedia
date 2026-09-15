"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Dialog from "./Dialog";
export type GalleryPhoto = {
  id: string;
  preview: string;
  title: string;
  width?: number;
  height?: number;
  download?: string;
  aspect?: "landscape" | "portrait";
};
function Photo({
  photo,
  large = false,
}: {
  photo: GalleryPhoto;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span role="status" className="block p-8 text-sm text-slate-300">
        Photo unavailable. Refresh or reopen your gallery.
      </span>
    );
  return (
    <img
      src={`${photo.preview}${photo.preview.includes("?") ? "&" : "?"}size=${large ? "large" : "thumb"}`}
      alt={photo.title}
      width={photo.width || 1200}
      height={photo.height || 800}
      loading={large ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={
        large ? "max-h-[72dvh] w-full object-contain" : "h-auto w-full"
      }
    />
  );
}
export default function GalleryLightbox({
  photos,
}: {
  photos: GalleryPhoto[];
}) {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    if (active === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setActive((i) =>
          i === null ? null : (i + photos.length - 1) % photos.length,
        );
      if (e.key === "ArrowRight")
        setActive((i) => (i === null ? null : (i + 1) % photos.length));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, photos.length]);
  if (!photos.length)
    return (
      <p className="panel text-center">No photos are published here yet.</p>
    );
  const photo = active === null ? null : photos[active];
  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActive(i)}
            aria-label={`Open ${p.title}`}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]"
          >
            <Photo photo={p} />
          </button>
        ))}
      </div>
      {photo && active !== null && (
        <Dialog label="Photo viewer" onClose={() => setActive(null)}>
          <div className="w-full max-w-6xl bg-[#07090d] p-3 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p aria-live="polite">
                {active + 1} of {photos.length}
              </p>
              <button
                className="icon-button"
                onClick={() => setActive(null)}
                aria-label="Close photo viewer"
              >
                <X />
              </button>
            </div>
            <Photo key={photo.id} photo={photo} large />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                className="icon-button"
                disabled={photos.length < 2}
                aria-label="Previous photo"
                onClick={() =>
                  setActive((active + photos.length - 1) % photos.length)
                }
              >
                <ChevronLeft />
              </button>
              <p className="max-w-[60%] break-words text-center text-sm">
                {photo.title}
              </p>
              <button
                className="icon-button"
                disabled={photos.length < 2}
                aria-label="Next photo"
                onClick={() => setActive((active + 1) % photos.length)}
              >
                <ChevronRight />
              </button>
            </div>
            {photo.download && (
              <a className="btn mt-4" href={photo.download} download>
                Download full resolution
              </a>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}
