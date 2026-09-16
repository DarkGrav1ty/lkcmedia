"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareImage } from "./prepare-image";

type Row = Record<string, any>;

const blankAlbum = {
  name: "",
  slug: "",
  gallery: "sports",
  event_date: "",
  is_visible: false,
  is_private: false,
  expires_at: "",
  sort_order: 0,
  pin: "",
};

async function api(path: string, method = "GET", body?: unknown) {
  const multipart = body instanceof FormData;

  const r = await fetch(path, {
    method,
    headers:
      body && !multipart
        ? { "Content-Type": "application/json" }
        : undefined,
    body: body
      ? multipart
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  const d = await r.json();

  if (!r.ok) {
    throw new Error(d.error || "Request failed.");
  }

  return d;
}

export default function AdminCMS({
  initialBookings,
  initialSettings,
  initialSections,
  initialMedia,
}: {
  initialBookings: Row[];
  initialSettings: Row;
  initialSections: Row[];
  initialMedia: Row[];
}) {
  const router = useRouter();

  const [tab, setTab] = useState("Bookings");
  const [bookings, setBookings] = useState(initialBookings);
  const [settings, setSettings] = useState(initialSettings);
  const [sections, setSections] = useState(initialSections);
  const [media, setMedia] = useState(initialMedia);
  const [albums, setAlbums] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Row | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [lightroomLinks, setLightroomLinks] = useState<
    Record<string, string>
  >({});

  async function run(job: () => Promise<void>) {
    setBusy(true);
    setNotice("");

    try {
      await job();
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function loadMedia(n = page) {
    const d = await api(`/api/admin/media?page=${n}`);

    setMedia(d.media);
    setTotal(d.total);
    setPage(n);
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "lkc-lightroom-links",
      );

      if (saved) {
        setLightroomLinks(JSON.parse(saved));
      }
    } catch {
      // Browser storage is optional.
    }

    run(async () => {
      const d = await api("/api/admin/albums");

      setAlbums(d.albums);
      await loadMedia(0);
    });
  }, []);

  function saveLightroomLink(
    albumId: string,
    value: string,
  ) {
    const next = {
      ...lightroomLinks,
      [albumId]: value,
    };

    setLightroomLinks(next);

    try {
      localStorage.setItem(
        "lkc-lightroom-links",
        JSON.stringify(next),
      );
    } catch {
      // Browser storage is optional.
    }
  }

  async function syncLightroomAlbum(album: Row) {
    const shareUrl =
      (lightroomLinks[album.id] || "").trim();

    if (!shareUrl) {
      throw new Error(
        "Paste the Lightroom share link first.",
      );
    }

    setNotice("Reading Lightroom album...");

    const discovery = await api(
      "/api/admin/lightroom/discover",
      "POST",
      {
        url: shareUrl,
      },
    );

    if (!discovery.images?.length) {
      throw new Error(
        "No importable photos were found in Lightroom.",
      );
    }

    let imported = 0;
    let skipped = 0;
    const failed: string[] = [];

    for (
      let index = 0;
      index < discovery.images.length;
      index++
    ) {
      const remote = discovery.images[index];

      setNotice(
        `Syncing ${index + 1} of ${discovery.images.length}: ${remote.fileName}`,
      );

      const exists = media.some(
        (item) =>
          item.album_id === album.id &&
          item.file_name === remote.fileName,
      );

      if (exists) {
        skipped++;
        continue;
      }

      try {
        const imageResponse = await fetch(
          `/api/admin/lightroom/image?url=${encodeURIComponent(
            remote.imageUrl,
          )}`,
        );

        if (!imageResponse.ok) {
          throw new Error("Download failed.");
        }

        const blob = await imageResponse.blob();

        const file = new File(
          [blob],
          remote.fileName,
          {
            type: blob.type || "image/jpeg",
          },
        );

        const form = await prepareImage(file);

        form.set("file", file);
        form.set("album_id", album.id);

        await api(
          "/api/admin/media",
          "POST",
          form,
        );

        imported++;
      } catch {
        failed.push(remote.fileName);
      }
    }

    await loadMedia(0);

    setNotice(
      `${imported} imported. ${skipped} already present.` +
        (failed.length
          ? ` ${failed.length} failed.`
          : ""),
    );
  }

  async function updateMedia(id: string, body: Row) {
    const d = await api(
      `/api/admin/media/${id}`,
      "PATCH",
      body,
    );

    setMedia((rows) =>
      rows.map((r) =>
        r.id === id ? d.media : r,
      ),
    );

    setNotice("Photo saved.");
  }

  return (
    <main className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>Manage LKC Media</h1>

        <button
          className="btn"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await api(
                "/api/admin/logout",
                "POST",
              );

              router.replace("/admin/login");
              router.refresh();
            })
          }
        >
          Sign out
        </button>
      </div>

      <nav
        aria-label="Admin navigation"
        className="mt-8 flex flex-wrap gap-3"
      >
        {[
          "Bookings",
          "Albums",
          "Media",
          "Website",
        ].map((t) => (
          <button
            key={t}
            className="btn"
            aria-pressed={tab === t}
            disabled={busy}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <p
        role="status"
        aria-live="polite"
        className="my-5 min-h-6 text-sky-200"
      >
        {busy ? "Working... " : ""}
        {notice}
      </p>

      {tab === "Albums" && (
        <>
          <button
            className="btn"
            onClick={() =>
              setEdit({ ...blankAlbum })
            }
          >
            New album
          </button>

          {edit && (
            <form
              className="panel grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();

                run(async () => {
                  const body = {
                    ...edit,
                    slug: edit.slug || undefined,
                    expires_at: edit.expires_at
                      ? new Date(
                          edit.expires_at,
                        ).toISOString()
                      : null,
                  };

                  const d = await api(
                    edit.id
                      ? `/api/admin/albums/${edit.id}`
                      : "/api/admin/albums",
                    edit.id ? "PATCH" : "POST",
                    body,
                  );

                  setAlbums((rows) =>
                    edit.id
                      ? rows.map((a) =>
                          a.id === edit.id
                            ? d.album
                            : a,
                        )
                      : [...rows, d.album],
                  );

                  setEdit(null);

                  setNotice(
                    "Album saved. Share its link and PIN separately.",
                  );
                });
              }}
            >
              <h2 className="text-xl font-bold sm:col-span-2">
                {edit.id
                  ? "Edit album"
                  : "New album"}
              </h2>

              <label className="field">
                Name
                <input
                  required
                  maxLength={160}
                  value={edit.name}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label className="field">
                URL name
                <input
                  pattern="[a-z0-9][a-z0-9-]{0,99}"
                  maxLength={100}
                  value={edit.slug}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      slug: e.target.value,
                    })
                  }
                />
              </label>

              <label className="field">
                Category
                <select
                  value={edit.gallery}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      gallery: e.target.value,
                    })
                  }
                >
                  <option value="sports">
                    Sports
                  </option>
                  <option value="portraits">
                    Portraits
                  </option>
                </select>
              </label>

              <label className="field">
                Event date
                <input
                  type="date"
                  value={edit.event_date || ""}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      event_date:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label className="field">
                Display order
                <input
                  type="number"
                  min={-100000}
                  max={100000}
                  value={edit.sort_order}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      sort_order: Number(
                        e.target.value,
                      ),
                    })
                  }
                />
              </label>

              <label className="field">
                Expires at (your local time, optional)
                <input
                  type="datetime-local"
                  value={edit.expires_at || ""}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      expires_at:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={edit.is_visible}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      is_visible:
                        e.target.checked,
                    })
                  }
                />
                Published / accessible
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={edit.is_private}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      is_private:
                        e.target.checked,
                    })
                  }
                />
                Private client gallery
              </label>

              {edit.is_private && (
                <label className="field">
                  {edit.id
                    ? "New PIN (leave blank to keep current)"
                    : "PIN (6-12 digits)"}

                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6,12}"
                    maxLength={12}
                    autoComplete="new-password"
                    value={edit.pin || ""}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        pin: e.target.value,
                      })
                    }
                  />
                </label>
              )}

              <p className="text-sm text-slate-300 sm:col-span-2">
                Saving access settings signs clients
                out. Publishing a public gallery makes
                its previews visible to anyone.
              </p>

              <div className="flex gap-3">
                <button
                  className="btn"
                  disabled={busy}
                >
                  Save album
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    setEdit(null)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {albums.map((a) => (
              <article
                className="panel"
                key={a.id}
              >
                <h2 className="break-words text-2xl font-bold">
                  {a.name}
                </h2>

                <p className="my-3 text-slate-300">
                  {a.is_private
                    ? "Private"
                    : "Public"}
                  {" | "}
                  {a.is_visible
                    ? "Published"
                    : "Hidden"}

                  {a.expires_at
                    ? ` | Expires ${new Date(
                        a.expires_at,
                      ).toLocaleString()}`
                    : ""}
                </p>

                <a
                  className="break-all underline"
                  href={`/${
                    a.is_private
                      ? "client"
                      : "gallery"
                  }/${a.slug}`}
                >
                  {`https://lkcmedia-az.com/${
                    a.is_private
                      ? "client"
                      : "gallery"
                  }/${a.slug}`}
                </a>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <h3 className="font-bold">
                    Lightroom Sync
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    Paste the public Lightroom album
                    link.
                  </p>

                  <input
                    className="mt-3 w-full"
                    type="url"
                    placeholder="https://adobe.ly/..."
                    value={
                      lightroomLinks[a.id] ||
                      ""
                    }
                    onChange={(e) =>
                      saveLightroomLink(
                        a.id,
                        e.target.value,
                      )
                    }
                  />

                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn"
                      disabled={
                        busy ||
                        !(
                          lightroomLinks[
                            a.id
                          ] || ""
                        ).trim()
                      }
                      onClick={() =>
                        run(() =>
                          syncLightroomAlbum(
                            a,
                          ),
                        )
                      }
                    >
                      Sync Lightroom Album
                    </button>

                    {(lightroomLinks[
                      a.id
                    ] || "").trim() && (
                      <button
                        type="button"
                        className="btn"
                        disabled={busy}
                        onClick={() =>
                          saveLightroomLink(
                            a.id,
                            "",
                          )
                        }
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="btn"
                    onClick={() => {
                      const local =
                        a.expires_at
                          ? new Date(
                              new Date(
                                a.expires_at,
                              ).getTime() -
                                new Date(
                                  a.expires_at,
                                ).getTimezoneOffset() *
                                  60000,
                            )
                              .toISOString()
                              .slice(0, 16)
                          : "";

                      setEdit({
                        ...a,
                        expires_at: local,
                        pin: "",
                      });
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete empty album "${a.name}"?`,
                        )
                      ) {
                        run(async () => {
                          await api(
                            `/api/admin/albums/${a.id}`,
                            "DELETE",
                          );

                          setAlbums((rows) =>
                            rows.filter(
                              (r) =>
                                r.id !== a.id,
                            ),
                          );

                          setNotice(
                            "Album deleted.",
                          );
                        });
                      }
                    }}
                  >
                    Delete empty album
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!albums.length && (
            <p className="panel">
              Create an album to organize your photos.
            </p>
          )}
        </>
      )}

      {tab === "Media" && (
        <>
          <div className="panel grid gap-4 sm:grid-cols-2">
            <label className="field">
              Upload into album

              <select
                value={selectedAlbum}
                onChange={(e) =>
                  setSelectedAlbum(
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Choose an album
                </option>

                {albums.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.name} (
                    {a.is_private
                      ? "private"
                      : "public"}
                    )
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Upload photos (JPEG, PNG, WebP; up
              to 20 MB each)

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={
                  busy ||
                  !selectedAlbum
                }
                onChange={(e) => {
                  const files =
                    Array.from(
                      e.target.files || [],
                    );

                  e.target.value = "";

                  run(async () => {
                    let completed = 0;
                    const failed: string[] =
                      [];

                    for (const file of files) {
                      setNotice(
                        `Preparing ${
                          completed +
                          failed.length +
                          1
                        } of ${
                          files.length
                        }: ${file.name}`,
                      );

                      try {
                        if (
                          file.size >
                          20 *
                            1024 *
                            1024
                        ) {
                          throw new Error(
                            "Over 20 MB",
                          );
                        }

                        const form =
                          await prepareImage(
                            file,
                          );

                        form.set(
                          "file",
                          file,
                        );

                        form.set(
                          "album_id",
                          selectedAlbum,
                        );

                        await api(
                          "/api/admin/media",
                          "POST",
                          form,
                        );

                        completed++;
                      } catch {
                        failed.push(
                          file.name,
                        );
                      }
                    }

                    await loadMedia(0);

                    setNotice(
                      `${completed} uploaded.` +
                        (failed.length
                          ? ` Failed: ${failed.join(
                              ", ",
                            )}. Retry those files.`
                          : ""),
                    );
                  });
                }}
              />
            </label>

            <p className="text-sm text-slate-300 sm:col-span-2">
              Originals are retained unchanged.
              Public previews are watermarked;
              private previews are clean.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((m) => (
              <article
                key={m.id}
                className="panel !mt-0"
              >
                <img
                  key={`${m.id}-${m.ready}`}
                  src={m.public_url}
                  alt={
                    m.alt_text ||
                    m.file_name
                  }
                  loading="lazy"
                  className="mb-4 aspect-[4/3] w-full rounded-lg object-contain"
                />

                <h2 className="mb-4 break-all font-bold">
                  {m.file_name}
                </h2>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();

                    const f =
                      new FormData(
                        e.currentTarget,
                      );

                    run(() =>
                      updateMedia(
                        m.id,
                        {
                          album_id:
                            f.get(
                              "album_id",
                            ),
                          alt_text:
                            f.get(
                              "alt_text",
                            ),
                          sport:
                            f.get(
                              "sport",
                            ),
                          sort_order:
                            Number(
                              f.get(
                                "sort_order",
                              ),
                            ),
                          is_visible:
                            f.get(
                              "visible",
                            ) === "on",
                          is_featured:
                            f.get(
                              "featured",
                            ) === "on",
                        },
                      ),
                    );
                  }}
                >
                  <label className="field">
                    Album

                    <select
                      name="album_id"
                      defaultValue={
                        m.album_id || ""
                      }
                      required
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {albums.map((a) => (
                        <option
                          key={a.id}
                          value={a.id}
                        >
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    Photo description

                    <input
                      name="alt_text"
                      maxLength={240}
                      defaultValue={
                        m.alt_text || ""
                      }
                    />
                  </label>

                  <label className="field">
                    Sport

                    <input
                      name="sport"
                      maxLength={80}
                      defaultValue={
                        m.sport || ""
                      }
                    />
                  </label>

                  <label className="field">
                    Display order

                    <input
                      name="sort_order"
                      type="number"
                      min={-100000}
                      max={100000}
                      defaultValue={
                        m.sort_order
                      }
                    />
                  </label>

                  <label className="flex gap-3">
                    <input
                      name="visible"
                      type="checkbox"
                      defaultChecked={
                        m.is_visible
                      }
                    />
                    Visible within album
                  </label>

                  <label className="flex gap-3">
                    <input
                      name="featured"
                      type="checkbox"
                      defaultChecked={
                        m.is_featured
                      }
                    />
                    Feature on homepage (public albums
                    only)
                  </label>

                  <button
                    className="btn"
                    disabled={busy}
                  >
                    Save photo
                  </button>
                </form>

                {!m.ready && (
                  <button
                    className="btn mt-3"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const r =
                          await fetch(
                            `/api/media/${m.id}?size=original`,
                          );

                        if (!r.ok) {
                          throw new Error(
                            "Original unavailable.",
                          );
                        }

                        const form =
                          await prepareImage(
                            await r.blob(),
                          );

                        await api(
                          `/api/admin/media/${m.id}`,
                          "POST",
                          form,
                        );

                        await loadMedia();

                        setNotice(
                          "Previews prepared; original preserved.",
                        );
                      })
                    }
                  >
                    Prepare previews
                  </button>
                )}

                <button
                  className="mt-4 block text-sm underline"
                  disabled={busy}
                  onClick={() => {
                    if (
                      confirm(
                        "Remove this photo from its album? The original will be retained.",
                      )
                    ) {
                      run(async () => {
                        await api(
                          `/api/admin/media/${m.id}`,
                          "DELETE",
                        );

                        await loadMedia();

                        setNotice(
                          "Photo removed from album. Original retained.",
                        );
                      });
                    }
                  }}
                >
                  Remove from album
                </button>
              </article>
            ))}
          </div>

          {!media.length && (
            <p className="panel">
              No photos yet. Choose an album and
              upload your first images.
            </p>
          )}

          <div className="mt-6 flex items-center gap-4">
            <button
              className="btn"
              disabled={
                busy ||
                page === 0
              }
              onClick={() =>
                run(() =>
                  loadMedia(page - 1),
                )
              }
            >
              Previous
            </button>

            <span>
              {total} photos | Page {page + 1}
            </span>

            <button
              className="btn"
              disabled={
                busy ||
                (page + 1) * 48 >=
                  total
              }
              onClick={() =>
                run(() =>
                  loadMedia(page + 1),
                )
              }
            >
              Next
            </button>
          </div>
        </>
      )}

      {tab === "Bookings" && (
        <>
          <h2 className="text-2xl font-bold">
            Recent requests
          </h2>

          {!bookings.length && (
            <p className="panel">
              No booking requests yet.
            </p>
          )}

          {bookings.map((b) => (
            <article
              key={b.id}
              className="panel"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <h2 className="text-xl font-bold">
                  {b.name} | {b.shoot_type}
                </h2>

                <label className="field">
                  Status

                  <select
                    disabled={busy}
                    value={b.status}
                    onChange={(e) => {
                      const status =
                        e.target.value;

                      run(async () => {
                        await api(
                          `/api/admin/bookings/${b.id}`,
                          "PATCH",
                          { status },
                        );

                        setBookings(
                          (rows) =>
                            rows.map(
                              (r) =>
                                r.id ===
                                b.id
                                  ? {
                                      ...r,
                                      status,
                                    }
                                  : r,
                            ),
                        );

                        setNotice(
                          "Booking updated.",
                        );
                      });
                    }}
                  >
                    {[
                      "new",
                      "contacted",
                      "confirmed",
                      "completed",
                      "cancelled",
                    ].map((s) => (
                      <option key={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <a
                className="underline"
                href={`mailto:${b.email}`}
              >
                {b.email}
              </a>

              <p className="mt-3">
                {b.shoot_date} |{" "}
                {b.location_name} |{" "}
                {b.location_address}
              </p>

              <p>
                {b.package} {b.instagram}
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words">
                {b.details}
              </p>

              <p className="mt-4 text-sm text-slate-300">
                Policies:{" "}
                {b.policy_version ||
                  "No recorded acceptance (legacy request)"}{" "}
                | Promotional discussion:{" "}
                {b.media_consent
                  ? "Requested"
                  : "Not requested"}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Owner email:{" "}
                {b.email_owner_sent ===
                true
                  ? "Accepted by provider"
                  : b.email_owner_sent ===
                      false
                    ? "Failed - follow up manually"
                    : "Not recorded"}{" "}
                | Client email:{" "}
                {b.email_customer_sent ===
                true
                  ? "Accepted by provider"
                  : b.email_customer_sent ===
                      false
                    ? "Failed"
                    : "Not recorded"}
              </p>
            </article>
          ))}
        </>
      )}

      {tab === "Website" && (
        <form
          className="panel space-y-5"
          onSubmit={(e) => {
            e.preventDefault();

            run(async () => {
              await api(
                "/api/admin/site",
                "PUT",
                {
                  settings,
                  sections,
                  deletedIds: deleted,
                },
              );

              setDeleted([]);

              setNotice(
                "Website settings saved.",
              );
            });
          }}
        >
          <h2 className="text-2xl font-bold">
            Website settings
          </h2>

          {[
            "site_name",
            "tagline",
            "contact_email",
            "instagram_url",
          ].map((k) => (
            <label
              className="field"
              key={k}
            >
              {k.replaceAll("_", " ")}

              <input
                value={
                  settings[k] || ""
                }
                maxLength={500}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    [k]: e.target.value,
                  })
                }
              />
            </label>
          ))}

          <p className="text-slate-300">
            The homepage design and Behind The Lens
            section are preserved. Existing optional
            content sections remain editable below.
          </p>

          {sections.map((s, i) => (
            <fieldset
              key={s.id}
              className="panel space-y-3"
            >
              <legend>
                Content section {i + 1}
              </legend>

              {[
                "title",
                "subtitle",
                "body",
                "image_url",
                "button_label",
                "button_href",
              ].map((k) => (
                <label
                  className="field"
                  key={k}
                >
                  {k.replaceAll(
                    "_",
                    " ",
                  )}

                  <textarea
                    rows={
                      k === "body"
                        ? 4
                        : 1
                    }
                    maxLength={
                      k === "body"
                        ? 5000
                        : 500
                    }
                    value={
                      s[k] || ""
                    }
                    onChange={(e) =>
                      setSections(
                        (rows) =>
                          rows.map(
                            (r) =>
                              r.id ===
                              s.id
                                ? {
                                    ...r,
                                    [k]:
                                      e
                                        .target
                                        .value,
                                  }
                                : r,
                          ),
                      )
                    }
                  />
                </label>
              ))}

              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={
                    s.is_visible
                  }
                  onChange={(e) =>
                    setSections(
                      (rows) =>
                        rows.map(
                          (r) =>
                            r.id ===
                            s.id
                              ? {
                                  ...r,
                                  is_visible:
                                    e
                                      .target
                                      .checked,
                                }
                              : r,
                        ),
                    )
                  }
                />
                Visible
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn"
                  disabled={i === 0}
                  onClick={() =>
                    setSections(
                      (rows) => {
                        const c = [
                          ...rows,
                        ];

                        [
                          c[i - 1],
                          c[i],
                        ] = [
                          c[i],
                          c[i - 1],
                        ];

                        return c;
                      },
                    )
                  }
                >
                  Move up
                </button>

                <button
                  type="button"
                  className="btn"
                  disabled={
                    i ===
                    sections.length - 1
                  }
                  onClick={() =>
                    setSections(
                      (rows) => {
                        const c = [
                          ...rows,
                        ];

                        [
                          c[i + 1],
                          c[i],
                        ] = [
                          c[i],
                          c[i + 1],
                        ];

                        return c;
                      },
                    )
                  }
                >
                  Move down
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setDeleted([
                      ...deleted,
                      s.id,
                    ]);

                    setSections(
                      (rows) =>
                        rows.filter(
                          (r) =>
                            r.id !==
                            s.id,
                        ),
                    );
                  }}
                >
                  Remove section
                </button>
              </div>
            </fieldset>
          ))}

          <div className="flex flex-wrap gap-3">
            {["text", "cta"].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  className="btn"
                  onClick={() =>
                    setSections([
                      ...sections,
                      {
                        id: crypto.randomUUID(),
                        section_type:
                          type,
                        title: "",
                        subtitle: "",
                        body: "",
                        image_url: null,
                        button_label:
                          null,
                        button_href:
                          null,
                        is_visible:
                          false,
                        sort_order:
                          sections.length,
                      },
                    ])
                  }
                >
                  Add {type} section
                </button>
              ),
            )}

            <button
              className="btn"
              disabled={busy}
            >
              Save website
            </button>
          </div>
        </form>
      )}
    </main>
  );
}