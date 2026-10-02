"use client";

import { useMemo, useState } from "react";
import { photoPriceCents, money } from "@/lib/photo-pricing";

type Photo = {
  id: string;
  title: string;
  width: number | null;
  height: number | null;
};

type Method = "cash" | "apple_cash" | "zelle";

export default function PhotoStorefront({
  albumId,
  photos,
}: {
  albumId: string;
  photos: Photo[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [method, setMethod] =
    useState<Method>("apple_cash");

  const total = useMemo(
    () => photoPriceCents(selected.length),
    [selected.length],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    );
  }

  async function submit() {
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          album_id: albumId,
          media_ids: selected,
          name,
          email,
          instagram,
          payment_method: method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not place order.",
        );
      }

      setSuccess(data);
      setCheckout(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not place order.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <section className="mt-10 rounded-2xl border border-blue-500/30 bg-blue-500/[0.06] p-6">
        <p className="eyebrow">Order received</p>

        <h2 className="mt-2 text-3xl font-semibold">
          {success.order_number}
        </h2>

        <p className="mt-4 text-slate-300">
          {success.photo_count} photos ·{" "}
          <strong className="text-white">
            {money(success.amount_cents)}
          </strong>
        </p>

        <p className="mt-3 max-w-2xl text-slate-400">
          Your order is awaiting payment confirmation.
          Once LKC Media confirms your Cash, Apple Cash,
          or Zelle payment, your private download gallery
          will be created and emailed to you.
        </p>
      </section>
    );
  }

  return (
    <>
      {/* SELECTION / CHECKOUT BAR */}
      <div className="sticky top-3 z-30 mt-8 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Your selection
            </div>

            <div className="text-xl font-semibold">
              {selected.length}{" "}
              {selected.length === 1
                ? "photo"
                : "photos"}{" "}
              · {money(total)}
            </div>
          </div>

          <div className="ml-auto flex gap-2">
            {selected.length > 0 && (
              <button
                type="button"
                className="rounded-xl bg-white/10 px-4 py-3 text-sm"
                onClick={() => setSelected([])}
              >
                Clear
              </button>
            )}

            <button
              type="button"
              disabled={!selected.length}
              onClick={() => setCheckout(true)}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-40"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>

      <p className="my-6 text-slate-300">
        {photos.length} photos · Select the photos you
        want. Images are shown in their full original
        composition.
      </p>

      {/* SAME MASONRY-STYLE PRESENTATION AS PREVIEW */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => {
          const active = selected.includes(photo.id);

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => toggle(photo.id)}
              aria-pressed={active}
              aria-label={
                active
                  ? `Remove ${photo.title} from order`
                  : `Add ${photo.title} to order`
              }
              className={`relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border bg-[#0d1118] text-left transition ${
                active
                  ? "border-blue-500 ring-2 ring-blue-500/50"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <img
                src={`/media/${photo.id}?size=large`}
                alt={
                  photo.title ||
                  `Photo ${index + 1}`
                }
                width={photo.width || 1200}
                height={photo.height || 800}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-contain"
              />

              <span
                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border text-base font-bold shadow-xl backdrop-blur ${
                  active
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-white/60 bg-black/70 text-white"
                }`}
              >
                {active ? "✓" : "+"}
              </span>
            </button>
          );
        })}
      </div>

      {/* CHECKOUT */}
      {checkout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            !busy && setCheckout(false)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#090b10] p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <p className="eyebrow">
              Photo order
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {selected.length} photos ·{" "}
              {money(total)}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Payment is confirmed manually for now.
              Your private download gallery is generated
              after LKC Media marks the order paid.
            </p>

            <div className="mt-6 space-y-3">
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Name"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
              />

              <input
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
              />

              <input
                value={instagram}
                onChange={(event) =>
                  setInstagram(
                    event.target.value,
                  )
                }
                placeholder="Instagram (optional)"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
              />

              <div>
                <p className="mb-2 text-sm text-slate-400">
                  How will you pay?
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["cash", "Cash"],
                    [
                      "apple_cash",
                      "Apple Cash",
                    ],
                    ["zelle", "Zelle"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setMethod(
                          value as Method,
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm ${
                        method === value
                          ? "border-blue-500 bg-blue-500/15"
                          : "border-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={
                  busy ||
                  !name.trim() ||
                  !email.trim()
                }
                onClick={submit}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-40"
              >
                {busy
                  ? "PLACING ORDER..."
                  : `PLACE ORDER · ${money(
                      total,
                    )}`}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setCheckout(false)
                }
                className="w-full rounded-xl bg-white/5 px-5 py-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}