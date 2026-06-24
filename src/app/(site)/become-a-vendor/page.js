"use client";
import { useState } from "react";
import Link from "next/link";

function generateStrongPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#$%&*!";
  const all = upper + lower + digits + symbols;
  const rand = (set) => set[Math.floor(Math.random() * set.length)];
  // Guarantee at least one from each group
  const required = [rand(upper), rand(lower), rand(digits), rand(symbols)];
  const rest = Array.from({ length: 8 }, () => rand(all));
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

export default function BecomeAVendorPage() {
  const [form, setForm] = useState({ storeName: "", contactName: "", email: "", phone: "", description: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generatedPwd, setGeneratedPwd] = useState("");
  const [pwdCopied, setPwdCopied] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleGenerate() {
    const pwd = generateStrongPassword();
    setGeneratedPwd(pwd);
    setForm((f) => ({ ...f, password: pwd, confirm: pwd }));
    setShowPassword(true);
    setShowConfirm(true);
    setPwdCopied(false);
  }

  function copyGenerated() {
    navigator.clipboard.writeText(generatedPwd).then(() => {
      setPwdCopied(true);
      setTimeout(() => setPwdCopied(false), 2500);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          description: form.description,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
        <div className="bg-white border border-brand-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-bold text-brand-950 mb-3">Application Submitted!</h2>
          <p className="text-ink-500 text-sm leading-relaxed mb-3">
            Thank you for applying to sell on Meglit Couture. Your application is currently <strong className="text-brand-950">under review</strong> by our team.
          </p>
          <p className="text-ink-500 text-sm leading-relaxed mb-6">
            You will receive an email notification once a decision has been made — typically within 2–3 business days. If approved, the email will include a direct link to sign in to your vendor dashboard.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-ink-400 mb-7">
            <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Check your inbox — we've sent a confirmation email.
          </div>
          <Link href="/" className="inline-block bg-brand-950 text-white text-sm font-semibold uppercase tracking-wider px-8 py-3 hover:bg-brand-800 transition-colors">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Hero */}
      <div className="bg-brand-950 text-white py-16 text-center px-4">
        <p className="text-accent-400 text-xs font-semibold uppercase tracking-[0.25em] mb-3">Partner with Meglit</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Sell on Meglit Couture</h1>
        <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
          List your fashion pieces to thousands of style-conscious shoppers. Meglit handles payments, you focus on your craft.
        </p>
      </div>

      {/* Benefits bar */}
      <div className="bg-accent-600 text-white">
        <div className="container-custom py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs font-medium">
          {["Reach thousands of buyers", "Secure Paystack payouts", "Meglit manages the platform"].map((b) => (
            <div key={b} className="flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-16 max-w-xl">
        <div className="bg-white border border-brand-100 p-8">
          <h2 className="font-heading text-2xl font-bold text-brand-950 mb-1">Vendor Application</h2>
          <p className="text-ink-500 text-sm mb-8">Fill in your details. Meglit will review and activate your account.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Store / Brand Name *" value={form.storeName} onChange={set("storeName")} placeholder="e.g. Adaeze Collections" required />
            <Field label="Contact Person *" value={form.contactName} onChange={set("contactName")} placeholder="Your full name" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Email Address *" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
              <Field label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+234 801 234 5678" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">
                About Your Store
              </label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                placeholder="Tell us about your brand, the types of clothing you sell, etc."
                className="w-full border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-950 transition-colors resize-none"
              />
            </div>
            {/* Password section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider">Password *</span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-600 hover:text-accent-700 uppercase tracking-wider transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate Password
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full border border-brand-200 bg-brand-50 pl-4 pr-11 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-950 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={set("confirm")}
                    placeholder="Repeat password"
                    required
                    className="w-full border border-brand-200 bg-brand-50 pl-4 pr-11 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-950 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated password display */}
              {generatedPwd && (
                <div className="mt-3 flex items-center gap-2 bg-brand-50 border border-brand-200 px-3 py-2.5 rounded">
                  <svg className="w-3.5 h-3.5 text-accent-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="flex-1 text-xs font-mono text-ink-700 tracking-wide truncate">{generatedPwd}</span>
                  <button
                    type="button"
                    onClick={copyGenerated}
                    className={`flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 transition-colors ${pwdCopied ? "text-green-700" : "text-accent-600 hover:text-accent-700"}`}
                  >
                    {pwdCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-950 text-white font-semibold text-sm uppercase tracking-wider py-4 hover:bg-brand-800 transition-colors disabled:opacity-50 mt-2"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>

            <p className="text-center text-xs text-ink-400">
              Already have an account?{" "}
              <Link href="/vendor/login" className="text-accent-600 hover:underline">
                Sign in to your vendor dashboard
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">{label}</label>
      <input
        {...props}
        className="w-full border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-950 transition-colors"
      />
    </div>
  );
}
