"use client";

import { useState } from "react";

/**
 * Reusable newsletter subscription form.
 *
 * Variants:
 *  - "footer" (default): dark background, stacked input + button
 *  - "inline": light background, side-by-side input + button
 */
export default function SubscribeForm({ variant = "footer", source = "footer" }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type, text }

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: "err", text: data?.error || "Could not subscribe." });
        return;
      }
      if (data.alreadySubscribed) {
        setStatus({ type: "ok", text: "You're already on the list — thanks!" });
      } else if (data.reactivated) {
        setStatus({ type: "ok", text: "Welcome back! You'll start hearing from us again." });
      } else {
        setStatus({ type: "ok", text: "Thanks for subscribing!" });
      }
      setEmail("");
    } catch {
      setStatus({ type: "err", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === "inline") {
    return (
      <div>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-5 py-3.5 border border-brand-200 bg-white text-sm focus:outline-none focus:border-brand-950 transition-colors placeholder:text-ink-300"
          />
          <button type="submit" disabled={submitting} className="btn-primary whitespace-nowrap disabled:opacity-60">
            {submitting ? "…" : "Subscribe"}
          </button>
        </form>
        {status && (
          <p className={`text-xs mt-3 ${status.type === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
            {status.text}
          </p>
        )}
      </div>
    );
  }

  // footer variant
  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full px-4 py-3 bg-white/[0.06] border border-brand-700 text-white placeholder:text-brand-500 text-sm focus:outline-none focus:border-accent-400 transition-colors"
        />
        <button type="submit" disabled={submitting} className="btn-accent w-full disabled:opacity-60">
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {status && (
        <p className={`text-xs mt-3 ${status.type === "ok" ? "text-accent-300" : "text-rose-300"}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
