"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VendorLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      router.replace("/vendor/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-heading text-3xl font-bold text-brand-950 tracking-[0.08em]">
            MEGLIT
          </Link>
          <p className="text-[11px] tracking-[0.25em] text-accent-600 uppercase font-medium mt-1">Vendor Portal</p>
        </div>

        <div className="bg-white border border-brand-100 p-8">
          <h1 className="font-heading text-xl font-bold text-brand-950 mb-6">Sign in to your store</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email" required autoFocus
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-brand-200 bg-brand-50 px-4 py-3 text-sm outline-none focus:border-brand-950 transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider">Password</label>
                <Link href="/vendor/forgot-password" className="text-[11px] text-accent-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-brand-200 bg-brand-50 px-4 py-3 text-sm outline-none focus:border-brand-950 transition-colors"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-950 text-white font-semibold text-sm uppercase tracking-wider py-3.5 hover:bg-brand-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-ink-400 mt-6">
            Want to sell on Meglit?{" "}
            <Link href="/become-a-vendor" className="text-accent-600 hover:underline">Apply here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
