"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from "lucide-react";

import Dialog from "./Dialog";

type Photo = {
  id: string;
  title: string;
  preview: string;
  download: string;
  width?: number;
  height?: number;
};

export default function ClientDownloadGallery({
  token,
  photos,
}: {
  token: string;
  photos: Photo[];
}) {
  const [selected, setSelected] =
    useState<string[]>([]);

  const [active, setActive] =
    useState<number | null>(null);

  const [busy, setBusy] =
    useState(false);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  }

  async function downloadZip(
    ids?: string[],
  ) {
    setBusy(true);

    try {
      const response = await fetch(
        `/api/client/c/${token}/zip`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            media_ids: ids || [],
          }),
        },
      );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.error ||
            "Download failed.",
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "LKC-Media-Photos.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(
        () =>
          URL.revokeObjectURL(url),
        1000,
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Download failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (active === null) return;

    const key = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "ArrowLeft"
      ) {
        setActive(
          (active +
            photos.length -
            1) %
            photos.length,
        );
      }

      if (
        event.key === "ArrowRight"
      ) {
        setActive(
          (active + 1) %
            photos.length,
        );
      }
    };

    window.addEventListener(
      "keydown",
      key,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        key,
      );
  }, [active, photos.length]);

  if (!photos.length) {
    return null;
  }

  const photo =
    active === null
      ? null
      : photos[active];

  return (
    <>
      <div className="sticky top-3 z-30 mb-6 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Downloads
            </div>

            <div className="font-semibold">
              {selected.length} selected
            </div>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            {selected.length > 0 && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setSelected([])
                  }
                  className="rounded-xl bg-white/10 px-4 py-3 text-sm"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    downloadZip(
                      selected,
                    )
                  }
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  <Download className="mr-2 inline h-4 w-4" />
                  {busy
                    ? "Preparing..."
                    : `Download Selected (${selected.length})`}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                downloadZip()
              }
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              <Download className="mr-2 inline h-4 w-4" />
              {busy
                ? "Preparing..."
                : `Download All (${photos.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map(
          (item, index) => {
            const checked =
              selected.includes(
                item.id,
              );

            return (
              <div
                key={item.id}
                className={`relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-[#0d1118] ${
                  checked
                    ? "border-blue-500 ring-2 ring-blue-500/50"
                    : "border-white/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActive(index)
                  }
                  className="block w-full"
                >
                  <img
                    src={`${item.preview}?size=thumb`}
                    alt={item.title}
                    width={
                      item.width ||
                      1200
                    }
                    height={
                      item.height ||
                      800
                    }
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggle(item.id)
                  }
                  aria-label={
                    checked
                      ? "Deselect photo"
                      : "Select photo"
                  }
                  className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-xl backdrop-blur ${
                    checked
                      ? "border-blue-400 bg-blue-600 text-white"
                      : "border-white/60 bg-black/70 text-white"
                  }`}
                >
                  {checked ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-xl">
                      +
                    </span>
                  )}
                </button>

                <a
                  href={item.download}
                  download
                  className="absolute bottom-3 right-3 rounded-xl bg-black/75 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur"
                >
                  <Download className="mr-1 inline h-4 w-4" />
                  Download
                </a>
              </div>
            );
          },
        )}
      </div>

      {photo &&
        active !== null && (
          <Dialog
            label="Photo viewer"
            onClose={() =>
              setActive(null)
            }
          >
            <div className="w-full max-w-6xl bg-[#07090d] p-3 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p>
                  {active + 1} of{" "}
                  {photos.length}
                </p>

                <button
                  className="icon-button"
                  onClick={() =>
                    setActive(null)
                  }
                  aria-label="Close"
                >
                  <X />
                </button>
              </div>

              <img
                src={`${photo.preview}?size=large`}
                alt={photo.title}
                width={
                  photo.width ||
                  1200
                }
                height={
                  photo.height ||
                  800
                }
                className="max-h-[72dvh] w-full object-contain"
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  className="icon-button"
                  onClick={() =>
                    setActive(
                      (active +
                        photos.length -
                        1) %
                        photos.length,
                    )
                  }
                >
                  <ChevronLeft />
                </button>

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggle(
                        photo.id,
                      )
                    }
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                      selected.includes(
                        photo.id,
                      )
                        ? "bg-blue-600"
                        : "bg-white/10"
                    }`}
                  >
                    {selected.includes(
                      photo.id,
                    )
                      ? "✓ Selected"
                      : "Select"}
                  </button>

                  <a
                    href={
                      photo.download
                    }
                    download
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
                  >
                    <Download className="mr-2 inline h-4 w-4" />
                    Download Full Resolution
                  </a>
                </div>

                <button
                  className="icon-button"
                  onClick={() =>
                    setActive(
                      (active + 1) %
                        photos.length,
                    )
                  }
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </Dialog>
        )}
    </>
  );
}
