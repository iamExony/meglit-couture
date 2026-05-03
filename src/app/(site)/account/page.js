"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function AccountPage() {
  const { customer, loading, signOut } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) router.replace("/signin?next=/account");
  }, [customer, loading, router]);

  if (loading || !customer) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink-400 text-sm">Loading…</div>;
  }

  return (
    <div className="bg-brand-50 min-h-[70vh] py-12">
      <div className="container-custom max-w-3xl">
        <h1 className="text-2xl font-semibold text-brand-950 mb-1">My account</h1>
        <p className="text-sm text-ink-500 mb-8">Manage your profile and shopping history.</p>

        <div className="bg-white border border-brand-100 rounded-xl p-6 mb-6 flex items-center gap-4">
          {customer.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customer.picture} alt="" className="w-14 h-14 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-semibold">
              {(customer.firstName?.[0] || customer.email?.[0] || "U").toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="text-base font-semibold text-brand-950">
              {customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim()}
            </div>
            <div className="text-sm text-ink-500">{customer.email}</div>
          </div>
          <button onClick={signOut} className="text-xs uppercase tracking-[0.15em] text-ink-600 hover:text-brand-950">
            Sign out
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/account/orders" className="bg-white border border-brand-100 rounded-xl p-6 hover:border-brand-300 transition-colors">
            <div className="text-sm font-semibold text-brand-950 mb-1">My orders</div>
            <div className="text-xs text-ink-500">View past orders and track shipments.</div>
          </Link>
          <Link href="/account/favorites" className="bg-white border border-brand-100 rounded-xl p-6 hover:border-brand-300 transition-colors">
            <div className="text-sm font-semibold text-brand-950 mb-1">Favorites</div>
            <div className="text-xs text-ink-500">Items you've saved for later.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
