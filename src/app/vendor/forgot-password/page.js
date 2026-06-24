"use client";
import { useState } from "react";
import Link from "next/link";

export default function VendorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong. Please try again.");
      }
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
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-bold text-brand-950 mb-2">Check your inbox</h2>
              <p className="text-sm text-ink-500 mb-6">
                If that email is registered on Meglit, you'll receive a password reset link shortly. The link expires in 1 hour.
              </p>
              <Link href="/vendor/login" className="text-sm text-accent-600 hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-xl font-bold text-brand-950 mb-2">Forgot your password?</h1>
              <p className="text-sm text-ink-500 mb-6">
                Enter your vendor email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">Email address</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-brand-200 bg-brand-50 px-4 py-3 text-sm outline-none focus:border-brand-950 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-950 text-white font-semibold text-sm uppercase tracking-wider py-3.5 hover:bg-brand-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-xs text-ink-400 mt-6">
                Remember your password?{" "}
                <Link href="/vendor/login" className="text-accent-600 hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
