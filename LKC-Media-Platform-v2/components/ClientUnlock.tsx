"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ClientUnlock({ slug }: { slug: string }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="panel mx-auto max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = e.currentTarget;
        try {
          const res = await fetch(
            `/api/client/${encodeURIComponent(slug)}/unlock`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pin: new FormData(form).get("pin") }),
            },
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          form.reset();
          router.refresh();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Could not unlock gallery.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        Gallery PIN
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6,12}"
          minLength={6}
          maxLength={12}
          autoComplete="off"
          required
          disabled={busy}
        />
      </label>
      <button className="btn mt-5" disabled={busy}>
        {busy ? "Checking…" : "Open gallery"}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
