"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-800",
  pending_review: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  approved: "Live",
  pending_review: "Under Review",
  rejected: "Rejected",
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-950">My Products</h1>
          <p className="text-ink-500 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 hover:bg-brand-800 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-lg p-12 text-center">
          <svg className="w-10 h-10 text-ink-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-ink-500 font-medium mb-1">No products yet</p>
          <p className="text-ink-400 text-sm mb-5">Add your first product and it will appear here after approval.</p>
          <Link
            href="/vendor/products/new"
            className="inline-block bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 hover:bg-brand-800 transition-colors"
          >
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-brand-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100 bg-brand-50">
              <tr>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Price</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-brand-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded border border-brand-100 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-brand-100 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-ink-800 truncate max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-ink-500 hidden sm:table-cell capitalize">{p.category || "—"}</td>
                  <td className="px-4 py-4 text-ink-800 font-medium text-right">₦{(p.price || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-ink-500 text-right hidden md:table-cell">{p.stock ?? 0}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.vendorStatus] || "bg-ink-100 text-ink-600"}`}>
                      {STATUS_LABELS[p.vendorStatus] || p.vendorStatus || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
