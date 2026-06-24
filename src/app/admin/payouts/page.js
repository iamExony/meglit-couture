"use client";
import { useEffect, useState } from "react";

const STATUS_STYLES = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
  { key: "paid", label: "Paid" },
];

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [retrying, setRetrying] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/payouts");
    const data = await res.json().catch(() => ({}));
    setPayouts(data.payouts || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function retry(id) {
    setRetrying(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ type: "success", text: `Transfer sent. Code: ${data.transferCode}` });
        await load();
      } else {
        setMsg({ type: "error", text: data.error || "Retry failed." });
      }
    } finally {
      setRetrying(null);
    }
  }

  const filtered = tab === "all" ? payouts : payouts.filter((p) => p.status === tab);
  const totals = {
    pending: payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.vendorAmount, 0),
    failed: payouts.filter((p) => p.status === "failed").reduce((s, p) => s + p.vendorAmount, 0),
    paid: payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.vendorAmount, 0),
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Paid Out", value: totals.paid, color: "text-green-700" },
          { label: "Pending", value: totals.pending, color: "text-amber-700" },
          { label: "Failed", value: totals.failed, color: "text-red-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-brand-100 rounded-xl p-5">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>₦{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-lg border ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-brand-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-brand-950 text-white" : "text-ink-600 hover:bg-brand-50"}`}
          >
            {t.label}
            {t.key !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({payouts.filter((p) => p.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-ink-400 text-sm">No payouts in this category.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 border-b border-brand-100 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Order</th>
                  <th className="px-4 py-3 text-right">Sale</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Commission</th>
                  <th className="px-4 py-3 text-right">Payout</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-800">{p.vendor?.storeName || "—"}</p>
                      <p className="text-[11px] text-ink-400">{p.vendor?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500 hidden sm:table-cell">
                      {p.orderReference || String(p.orderId || "").slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₦{(p.saleAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-ink-500 hidden md:table-cell">
                      ₦{(p.commissionAmount || 0).toLocaleString()}
                      <span className="text-[11px] ml-1">({Math.round((p.commissionRate || 0) * 100)}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      ₦{(p.vendorAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status] || "bg-ink-100 text-ink-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-ink-400 hidden md:table-cell">
                      {new Date(p.paidAt || p.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status !== "paid" && (
                        <button
                          onClick={() => retry(p._id)}
                          disabled={retrying === p._id}
                          className="text-xs font-semibold text-accent-700 hover:text-accent-900 disabled:opacity-50 transition-colors"
                        >
                          {retrying === p._id ? "Sending…" : "Retry"}
                        </button>
                      )}
                      {p.status === "paid" && p.paystackTransferCode && (
                        <span className="text-[11px] text-ink-400 font-mono">{p.paystackTransferCode.slice(0, 12)}…</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
