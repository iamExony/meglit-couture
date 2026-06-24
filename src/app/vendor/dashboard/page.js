"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/vendor/me").then((r) => r.json()),
      fetch("/api/vendor/products").then((r) => r.json()),
      fetch("/api/vendor/orders").then((r) => r.json()),
      fetch("/api/vendor/payouts").then((r) => r.json()),
    ]).then(([me, prods, ords, pays]) => {
      setVendor(me.vendor);
      setProducts(prods.products || []);
      setOrders(ords.orders || []);
      setPayouts(pays.payouts || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeProducts = products.filter((p) => p.vendorStatus === "approved").length;
  const pendingProducts = products.filter((p) => p.vendorStatus === "pending_review").length;
  const paidPayouts = payouts.filter((p) => p.status === "paid");
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "Total Earnings", value: `₦${(vendor?.totalEarnings || 0).toLocaleString()}`, sub: "All time" },
    { label: "Pending Payout", value: `₦${(vendor?.pendingPayout || 0).toLocaleString()}`, sub: "Awaiting delivery" },
    { label: "Total Paid Out", value: `₦${(vendor?.totalPaidOut || 0).toLocaleString()}`, sub: `${paidPayouts.length} payments` },
    { label: "Active Products", value: activeProducts, sub: pendingProducts > 0 ? `${pendingProducts} under review` : "All approved" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-brand-950 mb-1">
          Welcome back, {vendor?.storeName}
        </h1>
        <p className="text-ink-500 text-sm">Here's how your store is doing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-brand-100 p-5 rounded-lg">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-brand-950">{s.value}</p>
            <p className="text-[11px] text-ink-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-800">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-xs text-accent-600 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-ink-400 text-sm py-4 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-ink-800">{o.legacyId || o._id.slice(-8)}</p>
                    <p className="text-xs text-ink-400">{new Date(o.createdAt).toLocaleDateString("en-NG")}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${o.status === "delivered" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product status */}
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-800">My Products</h2>
            <Link href="/vendor/products" className="text-xs text-accent-600 hover:underline">Manage</Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-ink-400 text-sm mb-3">No products yet.</p>
              <Link href="/vendor/products/new" className="inline-block bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 hover:bg-brand-800 transition-colors">
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((p) => (
                <div key={p._id} className="flex justify-between items-center text-sm">
                  <p className="font-medium text-ink-800 truncate flex-1 mr-2">{p.name}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    p.vendorStatus === "approved" ? "bg-green-100 text-green-800" :
                    p.vendorStatus === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {p.vendorStatus === "approved" ? "Live" : p.vendorStatus === "rejected" ? "Rejected" : "Under Review"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
