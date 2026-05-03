"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

export default function MyOrdersPage() {
  const { customer, loading } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!loading && !customer) router.replace("/signin?next=/account/orders");
  }, [customer, loading, router]);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/auth/orders", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOrders(d?.orders || []))
      .catch(() => setOrders([]));
  }, [customer]);

  if (loading || !customer) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink-400 text-sm">Loading…</div>;
  }

  return (
    <div className="bg-brand-50 min-h-[70vh] py-12">
      <div className="container-custom max-w-3xl">
        <Link href="/account" className="text-xs text-ink-500 hover:text-brand-950 uppercase tracking-[0.15em]">← Account</Link>
        <h1 className="text-2xl font-semibold text-brand-950 mt-2 mb-6">My orders</h1>

        {orders === null ? (
          <div className="text-sm text-ink-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-brand-100 rounded-xl p-10 text-center">
            <div className="text-sm text-ink-500 mb-4">You haven't placed any orders yet.</div>
            <Link href="/shop" className="inline-block bg-brand-950 text-white text-xs uppercase tracking-[0.15em] px-5 py-3 rounded">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o._id || o.id || o.reference} className="bg-white border border-brand-100 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-ink-500 uppercase tracking-wider">{new Date(o.createdAt).toLocaleString()}</div>
                    <div className="font-mono text-sm text-brand-950 mt-1">{o.reference || o.legacyId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-brand-950">{NGN(o.total)}</div>
                    <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
                      o.status === "paid" ? "bg-emerald-50 text-emerald-700" :
                      o.status === "failed" ? "bg-rose-50 text-rose-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {o.status || "pending"}
                    </span>
                  </div>
                </div>
                {Array.isArray(o.items) && o.items.length > 0 && (
                  <div className="text-xs text-ink-500 mt-3 truncate">
                    {o.items.map((it) => `${it.name} ×${it.quantity}`).join(" · ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
