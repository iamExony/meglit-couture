"use client";

import { useEffect, useMemo, useState } from "react";

const fmt = (ts) => (ts ? new Date(ts).toLocaleString() : "—");

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [audience, setAudience] = useState("active");
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/subscribers", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setSubscribers(data?.subscribers || []);
      } finally {
        if (!cancelled) setLoadingSubs(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.active).length;
    return { total, active };
  }, [subscribers]);

  async function send(test) {
    setResult(null);
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          bodyText,
          bodyHtml,
          audience,
          testTo: test ? testTo : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ type: "err", text: data?.error || "Send failed" });
        return;
      }
      setResult({
        type: "ok",
        text: test
          ? `Test sent to ${testTo}.`
          : `Sent to ${data.sent}/${data.total}. ${data.failed ? data.failed + " failed." : ""}`,
      });
    } catch (err) {
      setResult({ type: "err", text: String(err?.message || err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Newsletter</h1>
          <p className="text-sm text-ink-500 mt-1">
            {loadingSubs ? "Loading…" : `${counts.active} active subscribers · ${counts.total} total`} ·
            sent from <code className="text-xs">info@meglitcouture.com</code>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-600 mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="New arrivals just dropped"
              className="w-full px-3 py-2 border border-brand-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-600 mb-1">
              Message <span className="text-ink-400 normal-case">(plain text)</span>
            </label>
            <textarea
              rows={8}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Hi there, we have something new for you…"
              className="w-full px-3 py-2 border border-brand-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
            />
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-ink-600">Advanced: custom HTML</summary>
            <textarea
              rows={6}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder="<p>Optional HTML body — overrides plain text.</p>"
              className="mt-2 w-full px-3 py-2 border border-brand-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
            />
          </details>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-brand-100">
            <label className="text-xs text-ink-700">Audience:</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="px-2 py-1 border border-brand-200 rounded text-sm"
            >
              <option value="active">Active only ({counts.active})</option>
              <option value="all">All ({counts.total})</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-brand-100">
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-[200px] px-3 py-2 border border-brand-200 rounded text-sm"
            />
            <button
              onClick={() => send(true)}
              disabled={sending || !subject || (!bodyText && !bodyHtml) || !testTo}
              className="px-4 py-2 border border-brand-300 text-brand-950 text-sm rounded hover:bg-brand-50 disabled:opacity-50"
            >
              Send test
            </button>
            <button
              onClick={() => {
                if (!confirm(`Send to ${audience === "all" ? counts.total : counts.active} subscribers?`)) return;
                send(false);
              }}
              disabled={sending || !subject || (!bodyText && !bodyHtml) || (audience === "active" ? counts.active === 0 : counts.total === 0)}
              className="px-4 py-2 bg-brand-950 text-white text-sm rounded hover:bg-brand-900 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send to subscribers"}
            </button>
          </div>

          {result && (
            <div
              className={`text-sm rounded p-3 border ${
                result.type === "ok"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {result.text}
            </div>
          )}
        </div>

        <div className="bg-white border border-brand-100 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-brand-950 mb-4">Recent subscribers</h2>
          {loadingSubs ? (
            <div className="text-sm text-ink-400">Loading…</div>
          ) : subscribers.length === 0 ? (
            <div className="text-sm text-ink-400">No subscribers yet.</div>
          ) : (
            <ul className="divide-y divide-brand-100 text-sm max-h-[480px] overflow-y-auto">
              {subscribers.slice(0, 50).map((s) => (
                <li key={s._id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-brand-950">{s.email}</div>
                    <div className="text-[11px] text-ink-400">
                      {s.source || "—"} · {fmt(s.subscribedAt)}
                    </div>
                  </div>
                  {s.active ? (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Active</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-ink-100 text-ink-500">Off</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
