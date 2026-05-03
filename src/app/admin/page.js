"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

function Stat({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-brand-100 rounded-xl p-5">
      <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-2 font-heading text-2xl font-bold ${accent || "text-brand-950"}`}>{value}</div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="text-ink-500">Loading...</div>;
  if (!data || !data.totals) return <div className="text-red-600">Failed to load analytics.</div>;

  const {
    totals,
    statusCounts = {},
    salesOverTime = [],
    topProducts = [],
    lowStock = [],
    outOfStock = [],
  } = data;
  const maxRev = Math.max(1, ...salesOverTime.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Revenue" value={NGN(totals.revenue)} sub={`${totals.orderCount} orders`} accent="text-accent-700" />
        <Stat label="Profit" value={NGN(totals.profit)} sub={`COGS ${NGN(totals.cogs)}`} />
        <Stat label="Inventory Value" value={NGN(totals.inventoryValue)} sub={`${totals.productCount} SKUs`} />
        <Stat label="Purchase Spend" value={NGN(totals.purchaseSpend)} sub="Restocking cost" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-brand-950">Sales — last 14 days</h2>
            <Link href="/admin/sales" className="text-xs text-accent-700 hover:underline">View all</Link>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {salesOverTime.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${NGN(d.revenue)} (${d.orders} orders)`}>
                <div
                  className="w-full bg-accent-500 rounded-t"
                  style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: d.revenue ? 2 : 0 }}
                />
                <div className="text-[9px] text-ink-400">{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Order Status</h2>
          {Object.keys(statusCounts).length === 0 && <div className="text-sm text-ink-500">No orders yet.</div>}
          <ul className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-ink-700">{status}</span>
                <span className="font-semibold text-brand-950">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <div className="text-sm text-ink-500">No sales yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-500 border-b border-brand-100">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
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
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Inventory Alerts</h2>
          <div className="text-xs uppercase tracking-wider text-ink-500 mb-2">Low stock</div>
          {lowStock.length === 0 ? (
            <div className="text-sm text-ink-500 mb-3">All good.</div>
          ) : (
            <ul className="space-y-1 text-sm mb-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="text-amber-700 font-medium ml-2">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
          <div className="text-xs uppercase tracking-wider text-ink-500 mb-2">Out of stock</div>
          {outOfStock.length === 0 ? (
            <div className="text-sm text-ink-500">None.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {outOfStock.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="text-red-600 font-medium ml-2">0</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
