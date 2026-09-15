"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="page-shell">
      <form
        className="panel mx-auto max-w-md"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                password: new FormData(form).get("password"),
              }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            form.reset();
            router.replace("/admin");
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to sign in.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1>Admin login</h1>
        <label className="field mt-8">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={512}
            disabled={busy}
          />
        </label>
        {error && (
          <p role="alert" className="mt-4 text-red-300">
            {error}
          </p>
        )}
        <button className="btn mt-5" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
