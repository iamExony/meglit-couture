"use client";

import { useState } from "react";

const SUBJECTS = ["General Inquiry", "Order Support", "Returns & Exchange", "Wholesale Inquiry", "Styling Advice", "Other"];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "ok"|"err", text }

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: "err", text: data?.error || "Could not send message. Please try again." });
        return;
      }
      setStatus({ type: "ok", text: "Thanks — your message has been sent. We'll get back to you shortly." });
      setForm({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
    } catch {
      setStatus({ type: "err", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1.5">Full Name</label>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={onChange}
            className="w-full px-4 py-3 border border-brand-200 text-sm focus:outline-none focus:border-brand-950 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1.5">Email Address</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            className="w-full px-4 py-3 border border-brand-200 text-sm focus:outline-none focus:border-brand-950 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1.5">Subject</label>
        <select
          name="subject"
          value={form.subject}
          onChange={onChange}
          className="w-full px-4 py-3 border border-brand-200 text-sm focus:outline-none focus:border-brand-950 transition-colors"
        >
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1.5">Phone Number</label>
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={onChange}
          className="w-full px-4 py-3 border border-brand-200 text-sm focus:outline-none focus:border-brand-950 transition-colors"
          placeholder="+234 800 000 0000"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1.5">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={onChange}
          className="w-full px-4 py-3 border border-brand-200 text-sm focus:outline-none focus:border-brand-950 transition-colors resize-none"
          placeholder="Tell us how we can help..."
        />
      </div>

      {status && (
        <div
          className={`text-sm border rounded p-3 ${
            status.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {status.text}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary py-4 w-full sm:w-auto disabled:opacity-60"
        id="send-message"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
