"use client";
import { useEffect, useState } from "react";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ productId: "", quantity: 1, unitCost: "", supplier: "", notes: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [p, pr] = await Promise.all([
      fetch("/api/admin/purchases").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ]);
    setPurchases(Array.isArray(p?.purchases) ? p.purchases : []);
    setProducts(Array.isArray(pr?.products) ? pr.products : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed");
      return;
    }
    setForm({ productId: "", quantity: 1, unitCost: "", supplier: "", notes: "" });
    await load();
  }

  async function remove(id) {
    if (!confirm("Reverse this purchase and remove its stock?")) return;
    await fetch(`/api/admin/purchases/${id}`, { method: "DELETE" });
    await load();
  }

  const totalSpend = purchases.reduce((s, p) => s + (p.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-500">Total Purchase Spend</div>
          <div className="mt-2 font-heading text-2xl font-bold text-brand-950">{NGN(totalSpend)}</div>
        </div>
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-500">Purchase Orders</div>
          <div className="mt-2 font-heading text-2xl font-bold text-brand-950">{purchases.length}</div>
        </div>
        <div className="bg-white border border-brand-100 rounded-xl p-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-500">Units Purchased</div>
          <div className="mt-2 font-heading text-2xl font-bold text-brand-950">{purchases.reduce((s, p) => s + p.quantity, 0)}</div>
        </div>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5">
        <h2 className="font-heading text-lg font-semibold text-brand-950 mb-4">Record Stock Purchase</h2>
        <form onSubmit={submit} className="grid md:grid-cols-5 gap-3">
          <select
            required
            value={form.productId}
            onChange={(e) => {
              const p = products.find((x) => String(x.id) === e.target.value);
              setForm({ ...form, productId: e.target.value, unitCost: p?.cost || form.unitCost });
            }}
            className="md:col-span-2 px-3 py-2 border border-brand-200 rounded-lg text-sm"
          >
            <option value="">Select product...</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input
            type="number" min="1" required placeholder="Qty"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="px-3 py-2 border border-brand-200 rounded-lg text-sm"
          />
          <input
            type="number" min="0" required placeholder="Unit Cost (₦)"
            value={form.unitCost}
            onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
            className="px-3 py-2 border border-brand-200 rounded-lg text-sm"
          />
          <input
            type="text" placeholder="Supplier"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            className="px-3 py-2 border border-brand-200 rounded-lg text-sm"
          />
          <input
            type="text" placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="md:col-span-4 px-3 py-2 border border-brand-200 rounded-lg text-sm"
          />
          <button type="submit" className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700">
            Record
          </button>
        </form>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-ink-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50">
                <tr className="text-left text-xs uppercase tracking-wider text-ink-600">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-t border-brand-100">
                    <td className="px-4 py-3 font-mono text-xs">PUR-{String(p.id).slice(-6)}</td>
                    <td className="px-4 py-3">{p.productName}</td>
                    <td className="px-4 py-3 text-xs text-ink-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">{p.quantity}</td>
                    <td className="px-4 py-3 text-right">{NGN(p.unitCost)}</td>
                    <td className="px-4 py-3 text-right font-medium">{NGN(p.total)}</td>
                    <td className="px-4 py-3">{p.supplier || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(p.id)} className="text-red-600 hover:underline text-xs">Reverse</button>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-ink-500">No purchases recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
