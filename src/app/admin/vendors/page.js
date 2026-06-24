"use client";
import { useState, useEffect, useRef } from "react";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-ink-100 text-ink-600",
};

const TABS = ["all", "pending", "active", "suspended", "rejected"];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [acting, setActing] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      setVendors(data.vendors || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function doAction(id, action) {
    setActing(id + action);
    try {
      await fetch(`/api/admin/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
    } finally {
      setActing(null);
    }
  }

  const filtered = tab === "all" ? vendors : vendors.filter((v) => v.status === tab);
  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? vendors.length : vendors.filter((v) => v.status === t).length;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-brand-950 mb-1">Vendors</h1>
          <p className="text-ink-500 text-sm">Manage partner fashion stores on Meglit Couture.</p>
        </div>
        <div className="flex items-center gap-3">
          {counts.pending > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
              {counts.pending} pending
            </span>
          )}
          <button
            onClick={() => setShowInvite((v) => !v)}
            className="flex items-center gap-2 bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-brand-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Invite Vendor
          </button>
        </div>
      </div>

      {/* Invite panel */}
      {showInvite && <InvitePanel onClose={() => setShowInvite(false)} />}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-brand-950 text-brand-950"
                : "border-transparent text-ink-400 hover:text-ink-700"
            }`}
          >
            {t} {counts[t] > 0 && <span className="ml-1 opacity-60">({counts[t]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <p className="font-heading text-lg">No {tab === "all" ? "" : tab} vendors yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white border border-brand-100 rounded-lg p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-ink-900 truncate">{vendor.storeName}</h3>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[vendor.status]}`}>
                    {vendor.status}
                  </span>
                </div>
                <p className="text-sm text-ink-500">
                  {vendor.contactName} · {vendor.email}
                  {vendor.phone && ` · ${vendor.phone}`}
                </p>
                {vendor.description && (
                  <p className="text-xs text-ink-400 mt-1 line-clamp-1">{vendor.description}</p>
                )}
                <p className="text-[11px] text-ink-300 mt-1">
                  Applied {new Date(vendor.appliedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  {vendor.approvedAt && ` · Approved ${new Date(vendor.approvedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
              </div>

              {/* Earnings summary */}
              <div className="hidden md:flex flex-col items-end text-right gap-0.5 mr-4">
                <p className="text-xs text-ink-400">Total earnings</p>
                <p className="font-semibold text-ink-800 text-sm">
                  ₦{(vendor.totalEarnings || 0).toLocaleString()}
                </p>
                {(vendor.pendingPayout || 0) > 0 && (
                  <p className="text-[11px] text-amber-700">₦{vendor.pendingPayout.toLocaleString()} pending</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {vendor.status === "pending" && (
                  <>
                    <button
                      onClick={() => doAction(vendor._id, "approve")}
                      disabled={!!acting}
                      className="bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-green-800 transition-colors disabled:opacity-50"
                    >
                      {acting === vendor._id + "approve" ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => doAction(vendor._id, "reject")}
                      disabled={!!acting}
                      className="bg-red-100 text-red-700 text-xs font-semibold px-4 py-2 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {acting === vendor._id + "reject" ? "…" : "Reject"}
                    </button>
                  </>
                )}
                {vendor.status === "active" && (
                  <>
                    <button
                      onClick={() => doAction(vendor._id, "suspend")}
                      disabled={!!acting}
                      className="bg-ink-100 text-ink-700 text-xs font-semibold px-4 py-2 rounded hover:bg-ink-200 transition-colors disabled:opacity-50"
                    >
                      {acting === vendor._id + "suspend" ? "…" : "Suspend"}
                    </button>
                    {confirmRemove === vendor._id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs text-red-700 font-medium">Remove?</span>
                        <button
                          onClick={async () => { setConfirmRemove(null); await doAction(vendor._id, "remove"); }}
                          disabled={!!acting}
                          className="bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Yes, remove
                        </button>
                        <button
                          onClick={() => setConfirmRemove(null)}
                          className="bg-white border border-brand-200 text-ink-600 text-xs font-semibold px-3 py-2 rounded hover:bg-brand-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(vendor._id)}
                        disabled={!!acting}
                        className="bg-red-50 text-red-700 text-xs font-semibold px-4 py-2 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </>
                )}
                {(vendor.status === "rejected" || vendor.status === "suspended") && (
                  <button
                    onClick={() => doAction(vendor._id, "approve")}
                    disabled={!!acting}
                    className="bg-green-100 text-green-800 text-xs font-semibold px-4 py-2 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {acting === vendor._id + "approve" ? "…" : "Reinstate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvitePanel({ onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const linkRef = useRef(null);

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/become-a-vendor`
    : "/become-a-vendor";

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function sendInvite(e) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/admin/vendors/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send."); return; }
      setSent(true);
      setEmail("");
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white border border-brand-200 rounded-lg p-5 mb-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-ink-300 hover:text-ink-600 transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 className="text-sm font-semibold text-ink-800 mb-4">Invite a Vendor</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Copy link */}
        <div>
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-2">
            Application Link
          </p>
          <p className="text-xs text-ink-400 mb-3">
            Share this link with any store you want to invite. Anyone with this link can submit an application.
          </p>
          <div className="flex items-center border border-brand-200 bg-brand-50 rounded overflow-hidden">
            <input
              ref={linkRef}
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent px-3 py-2.5 text-xs text-ink-600 outline-none min-w-0 truncate"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold flex-shrink-0 border-l border-brand-200 transition-colors ${
                copied
                  ? "bg-green-50 text-green-700"
                  : "bg-white text-ink-600 hover:bg-brand-50 hover:text-brand-950"
              }`}
            >
              {copied ? (
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
        </div>

        {/* Email invite */}
        <div>
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-2">
            Send via Email
          </p>
          <p className="text-xs text-ink-400 mb-3">
            Enter a vendor's email and we'll send them a branded invitation directly.
          </p>
          <form onSubmit={sendInvite} className="flex items-center gap-2">
            <input
              type="email"
              required
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); setSent(false); }}
              className="flex-1 border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-950 transition-colors min-w-0"
            />
            <button
              type="submit"
              disabled={sending || !email}
              className="flex-shrink-0 bg-accent-600 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 hover:bg-accent-700 transition-colors disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
          {sent && (
            <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Invitation sent successfully.
            </p>
          )}
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
