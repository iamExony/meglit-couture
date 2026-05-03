"use client";
import { useEffect, useMemo, useState } from "react";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

export default function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState("30");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/analytics").then((r) => r.json()),
    ]).then(([o, a]) => {
      setOrders(o.orders || []);
      setAnalytics(a);
    });
  }, []);

  const filtered = useMemo(() => {
    const days = Number(range);
    if (!days) return orders;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff && !["cancelled", "refunded"].includes(o.status));
  }, [orders, range]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const itemsSold = filtered.reduce((s, o) => s + (o.items || []).reduce((x, it) => x + (it.quantity || 0), 0), 0);
    const aov = filtered.length ? revenue / filtered.length : 0;
    return { revenue, itemsSold, aov, count: filtered.length };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <label className="text-xs uppercase tracking-wider text-ink-500">Range:</label>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="px-3 py-1.5 border border-brand-200 rounded-lg text-sm">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="0">All time</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Revenue" value={NGN(totals.revenue)} />
        <Card label="Orders" value={totals.count} />
        <Card label="Items Sold" value={totals.itemsSold} />
        <Card label="Avg Order Value" value={NGN(Math.round(totals.aov))} />
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5">
        <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Top Products</h2>
        {!analytics ? (
          <div className="text-ink-500 text-sm">Loading...</div>
        ) : analytics.topProducts.length === 0 ? (
          <div className="text-ink-500 text-sm">No sales yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-500 border-b border-brand-100">
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Units</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((p, i) => (
                <tr key={p.id ?? p.name ?? i} className="border-b border-brand-50 last:border-0">
                  <td className="py-2.5">{p.name}</td>
                  <td className="py-2.5 text-right">{p.quantity}</td>
                  <td className="py-2.5 text-right font-medium">{NGN(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5">
        <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-500 border-b border-brand-100">
                <th className="py-2">Order</th>
                <th className="py-2">Date</th>
                <th className="py-2">Customer</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 25).map((o) => (
                <tr key={o.id} className="border-b border-brand-50 last:border-0">
                  <td className="py-2 font-mono text-xs">{o.id}</td>
                  <td className="py-2 text-xs text-ink-600">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-2">{o.customer?.firstName} {o.customer?.lastName}</td>
                  <td className="py-2 text-right font-medium">{NGN(o.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-ink-500">No sales in this range.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white border border-brand-100 rounded-xl p-5">
      <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 font-heading text-2xl font-bold text-brand-950">{value}</div>
    </div>
  );
}
