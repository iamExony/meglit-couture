"use client";

import { useEffect, useMemo, useState } from "react";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;
const fmt = (ts) => (ts ? new Date(ts).toLocaleDateString() : "—");

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [marketingOnly, setMarketingOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/customers", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setCustomers(data?.customers || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (marketingOnly && !c.marketingOptIn) return false;
      if (!q) return true;
      const hay = `${c.name || ""} ${c.email || ""} ${c.phone || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [customers, query, marketingOnly]);

  const totals = useMemo(() => {
    const total = customers.length;
    const opted = customers.filter((c) => c.marketingOptIn).length;
    const spend = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
    return { total, opted, spend };
  }, [customers]);

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Phone", "Marketing opt-in", "Email verified", "Orders", "Total spent (NGN)", "Last order", "Last login", "Joined"],
      ...filtered.map((c) => [
        c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        c.email || "",
        c.phone || "",
        c.marketingOptIn ? "yes" : "no",
        c.emailVerified ? "yes" : "no",
        c.orderCount || 0,
        c.totalSpent || 0,
        c.lastOrderAt ? new Date(c.lastOrderAt).toISOString() : "",
        c.lastLoginAt ? new Date(c.lastLoginAt).toISOString() : "",
        c.createdAt ? new Date(c.createdAt).toISOString() : "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meglit-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Customers</h1>
          <p className="text-sm text-ink-500 mt-1">
            {totals.total} total · {totals.opted} opted-in for marketing · lifetime revenue {NGN(totals.spend)}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="bg-brand-950 text-white text-xs uppercase tracking-[0.15em] px-4 py-2 rounded disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone…"
          className="flex-1 min-w-[220px] px-3 py-2 border border-brand-200 text-sm rounded"
        />
        <label className="flex items-center gap-2 text-xs text-ink-700">
          <input
            type="checkbox"
            checked={marketingOnly}
            onChange={(e) => setMarketingOnly(e.target.checked)}
          />
          Marketing opt-in only
        </label>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-ink-400">Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-400">No customers match.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-right px-4 py-3">Orders</th>
                  <th className="text-right px-4 py-3">Spent</th>
                  <th className="text-left px-4 py-3">Last order</th>
                  <th className="text-left px-4 py-3">Last login</th>
                  <th className="text-center px-4 py-3">Marketing</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-brand-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.picture} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-semibold">
                            {(c.firstName?.[0] || c.email?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                        <div className="font-medium text-brand-950">
                          {c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{c.email}</td>
                    <td className="px-4 py-3 text-ink-600">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-right">{c.orderCount}</td>
                    <td className="px-4 py-3 text-right">{NGN(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-ink-500">{fmt(c.lastOrderAt)}</td>
                    <td className="px-4 py-3 text-ink-500">{fmt(c.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-center">
                      {c.marketingOptIn ? (
                        <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-700">Yes</span>
                      ) : (
                        <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-ink-100 text-ink-500">No</span>
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
