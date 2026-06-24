"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("No reset token found. Please use the link from your email.");
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.replace("/vendor/login"), 3000);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleShow(field) {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  }

  const EyeIcon = ({ visible }) => visible ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-bold text-brand-950 mb-2">Password updated!</h2>
              <p className="text-sm text-ink-500 mb-4">
                Your password has been changed. Redirecting you to sign in…
              </p>
              <Link href="/vendor/login" className="text-sm text-accent-600 hover:underline">
                Sign in now
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-xl font-bold text-brand-950 mb-2">Set new password</h1>
              <p className="text-sm text-ink-500 mb-6">
                Choose a strong password for your vendor account.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">
                  {error}
                  {error.includes("expired") && (
                    <span>
                      {" "}<Link href="/vendor/forgot-password" className="underline font-semibold">Request a new link</Link>
                    </span>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">New password</label>
                  <div className="relative">
                    <input
                      type={show.password ? "text" : "password"}
                      required
                      autoFocus
                      minLength={8}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className="w-full border border-brand-200 bg-brand-50 pl-4 pr-11 py-3 text-sm outline-none focus:border-brand-950 transition-colors"
                    />
                    <button type="button" onClick={() => toggleShow("password")} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                      <EyeIcon visible={show.password} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">Confirm password</label>
                  <div className="relative">
                    <input
                      type={show.confirm ? "text" : "password"}
                      required
                      value={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat password"
                      className="w-full border border-brand-200 bg-brand-50 pl-4 pr-11 py-3 text-sm outline-none focus:border-brand-950 transition-colors"
                    />
                    <button type="button" onClick={() => toggleShow("confirm")} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                      <EyeIcon visible={show.confirm} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-brand-950 text-white font-semibold text-sm uppercase tracking-wider py-3.5 hover:bg-brand-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>

              <p className="text-center text-xs text-ink-400 mt-6">
                <Link href="/vendor/forgot-password" className="text-accent-600 hover:underline">
                  Request a new link
                </Link>
                {" · "}
                <Link href="/vendor/login" className="hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendorResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
