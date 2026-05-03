"use client";
import { useEffect, useState } from "react";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-ink-500">Loading...</div>;

  const { totals, statusCounts, salesOverTime, topProducts, lowStock, outOfStock } = data;
  const maxRev = Math.max(1, ...salesOverTime.map((d) => d.revenue));
  const maxOrders = Math.max(1, ...salesOverTime.map((d) => d.orders));
  const margin = totals.revenue ? (totals.profit / totals.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Revenue" value={NGN(totals.revenue)} />
        <Card label="COGS" value={NGN(totals.cogs)} />
        <Card label="Profit" value={NGN(totals.profit)} sub={`${margin.toFixed(1)}% margin`} />
        <Card label="Inventory Value" value={NGN(totals.inventoryValue)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Revenue (14d)</h2>
          <Bars data={salesOverTime} max={maxRev} accessor="revenue" color="bg-accent-500" format={NGN} />
        </div>
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Orders (14d)</h2>
          <Bars data={salesOverTime} max={maxOrders} accessor="orders" color="bg-brand-500" format={(n) => n} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Order Status Breakdown</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(statusCounts).map(([s, c]) => (
              <li key={s} className="flex justify-between">
                <span className="capitalize text-ink-700">{s}</span>
                <span className="font-semibold text-brand-950">{c}</span>
              </li>
            ))}
            {Object.keys(statusCounts).length === 0 && <li className="text-ink-500">No orders.</li>}
          </ul>
        </div>

        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <div className="text-ink-500 text-sm">No sales yet.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {topProducts.map((p, i) => (
                <li key={p.id ?? p.name ?? i} className="flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="font-semibold text-brand-950 ml-2">{NGN(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Low Stock</h2>
          {lowStock.length === 0 ? <div className="text-ink-500 text-sm">All good.</div> : (
            <ul className="space-y-1 text-sm">
              {lowStock.map((p) => <li key={p.id} className="flex justify-between"><span>{p.name}</span><span className="text-amber-700 font-medium">{p.stock}</span></li>)}
            </ul>
          )}
        </div>
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Out of Stock</h2>
          {outOfStock.length === 0 ? <div className="text-ink-500 text-sm">None.</div> : (
            <ul className="space-y-1 text-sm">
              {outOfStock.map((p) => <li key={p.id} className="flex justify-between"><span>{p.name}</span><span className="text-red-600 font-medium">0</span></li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, sub }) {
  return (
    <div className="bg-white border border-brand-100 rounded-xl p-5">
      <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 font-heading text-2xl font-bold text-brand-950">{value}</div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}

function Bars({ data, max, accessor, color, format }) {
  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${format(d[accessor])}`}>
          <div className={`w-full rounded-t ${color}`} style={{ height: `${(d[accessor] / max) * 100}%`, minHeight: d[accessor] ? 2 : 0 }} />
          <div className="text-[9px] text-ink-400">{d.date.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}
