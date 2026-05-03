"use client";
import { useEffect, useState } from "react";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;
const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_CLASS = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-amber-100 text-amber-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    if (selected?.id === id) setSelected({ ...selected, status });
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${
              filter === s ? "bg-brand-950 text-white" : "bg-white border border-brand-200 text-ink-700 hover:bg-brand-50"
            }`}
          >
            {s} {s !== "all" && `(${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-ink-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50">
                <tr className="text-left text-xs uppercase tracking-wider text-ink-600">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-brand-100 hover:bg-brand-50/50 cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-4 py-3">{o.customer?.firstName} {o.customer?.lastName}<div className="text-xs text-ink-500">{o.customer?.email}</div></td>
                    <td className="px-4 py-3 text-ink-600 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{NGN(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${STATUS_CLASS[o.status] || "bg-gray-100 text-gray-700"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-ink-500">No orders.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
              <div>
                <h2 className="font-heading text-lg font-semibold text-brand-950">{selected.id}</h2>
                <div className="text-xs text-ink-500 font-mono">Ref: {selected.reference}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-500 hover:text-ink-950">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-ink-500">Status:</span>
                <select
                  value={selected.status}
                  onChange={(e) => setStatus(selected.id, e.target.value)}
                  className="px-3 py-1.5 border border-brand-200 rounded-lg text-sm capitalize"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-ink-500 mb-2">Customer</h3>
                <div className="text-sm space-y-0.5">
                  <div>{selected.customer?.firstName} {selected.customer?.lastName}</div>
                  <div className="text-ink-600">{selected.customer?.email} · {selected.customer?.phone}</div>
                  <div className="text-ink-600">{selected.customer?.address}, {selected.customer?.city}, {selected.customer?.state}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wider text-ink-500 mb-2">Items</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {selected.items?.map((it, i) => (
                      <tr key={i} className="border-b border-brand-50 last:border-0">
                        <td className="py-2">{it.name} <span className="text-ink-500 text-xs">×{it.quantity}</span></td>
                        <td className="py-2 text-right">{NGN((it.price || 0) * (it.quantity || 1))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <div className="border-t border-brand-100 pt-3 space-y-1 text-sm">
                {selected.shipping !== undefined && (
                  <div className="flex justify-between text-ink-600"><span>Shipping</span><span>{NGN(selected.shipping)}</span></div>
                )}
                <div className="flex justify-between font-semibold text-brand-950 text-base"><span>Total</span><span>{NGN(selected.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
