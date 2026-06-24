"use client";
import { useEffect, useState } from "react";

const TABS = [
  { key: "pending_review", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function VendorProductsAdminPage() {
  const [tab, setTab] = useState("pending_review");
  const [products, setProducts] = useState([]);
  const [vendorMap, setVendorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    fetch("/api/admin/vendors")
      .then((r) => r.json())
      .then((d) => {
        const map = {};
        for (const v of d.vendors || []) map[v._id] = v.storeName;
        setVendorMap(map);
      });
  }, []);

  async function load(status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendor-products?status=${status}`);
      let data = {};
      try { data = await res.json(); } catch { /* empty body */ }
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  async function act(id, action) {
    setActing(id + action);
    try {
      const res = await fetch(`/api/admin/vendor-products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) await load(tab);
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white border border-brand-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-brand-950 text-white" : "text-ink-600 hover:bg-brand-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-500 text-sm">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-ink-500 text-sm">No products in this category.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 border-b border-brand-100">
                <tr className="text-left text-xs uppercase tracking-wider text-ink-600">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Vendor</th>
                  <th className="px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Stock</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {tab === "pending_review" && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-brand-100 hover:bg-brand-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-brand-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-brand-100 rounded flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-brand-950 max-w-[180px] truncate">{p.name}</div>
                          <div className="text-xs text-ink-400">₦{(p.price || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600 hidden sm:table-cell text-xs">
                      {vendorMap[p.vendorId] || "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-600 hidden md:table-cell capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-right font-medium">₦{(p.price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-ink-500 hidden md:table-cell">{p.stock ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.vendorStatus] || "bg-ink-100 text-ink-600"}`}>
                        {p.vendorStatus === "pending_review" ? "Pending" : p.vendorStatus === "approved" ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    {tab === "pending_review" && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => act(p._id, "approve")}
                          disabled={!!acting}
                          className="text-xs font-semibold text-green-700 hover:text-green-900 mr-3 disabled:opacity-50 transition-colors"
                        >
                          {acting === p._id + "approve" ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => act(p._id, "reject")}
                          disabled={!!acting}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                        >
                          {acting === p._id + "reject" ? "..." : "Reject"}
                        </button>
                      </td>
                    )}
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
