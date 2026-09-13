"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setLoading(true); setError("");
        const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
        const result = await response.json();
        setLoading(false);
        if (!response.ok) return setError(result.error || "Unable to sign in.");
        router.replace("/admin"); router.refresh();
    }

    return <main className="grid min-h-screen place-items-center bg-[#07090d] px-5 text-white">
        <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1118] p-8">
            <img src="/logo/lkc-logo.png" alt="LKC Media" className="h-16 w-16 rounded-xl object-cover" />
            <p className="mt-6 text-xs font-black uppercase tracking-[.25em] text-[#0088ff]">LKC Media CMS</p>
            <h1 className="mt-2 text-4xl font-black">Admin Login</h1>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="mt-8 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#0088ff]" autoFocus />
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#0088ff] px-5 py-3 font-black disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
    </main>;
}
