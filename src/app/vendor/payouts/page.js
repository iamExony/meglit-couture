"use client";
import { useEffect, useState } from "react";

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
};

export default function VendorPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/vendor/me").then((r) => r.json()),
      fetch("/api/vendor/payouts").then((r) => r.json()),
    ]).then(([me, pays]) => {
      setVendor(me.vendor);
      setPayouts(pays.payouts || []);
    }).finally(() => setLoading(false));
  }, []);

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.vendorAmount, 0);
  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.vendorAmount, 0);

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold text-brand-950 mb-1">Payouts</h1>
      <p className="text-ink-500 text-sm mb-8">Your earnings after Meglit's commission.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">Total Paid Out</p>
          <p className="text-2xl font-bold text-green-700">₦{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">Pending</p>
          <p className="text-2xl font-bold text-amber-700">₦{totalPending.toLocaleString()}</p>
          <p className="text-[11px] text-ink-400 mt-1">Released when orders are delivered</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-lg p-5">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">Total Earnings</p>
          <p className="text-2xl font-bold text-brand-950">₦{(vendor?.totalEarnings || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Bank details notice */}
      {!vendor?.accountNumber && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 mb-6 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Add your bank details</strong> to receive payouts. Contact Meglit support to update your payout account.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <p className="font-heading text-lg">No payouts yet.</p>
          <p className="text-sm mt-1">Payouts are created automatically when a customer's order is marked as delivered.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-100">
              <tr>
                <th className="text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider px-5 py-3">Order</th>
                <th className="text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider px-5 py-3">Sale</th>
                <th className="text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider px-5 py-3">Commission</th>
                <th className="text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider px-5 py-3">You Receive</th>
                <th className="text-center text-[11px] font-semibold text-ink-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-brand-50 transition-colors">
                  <td className="px-5 py-4 text-ink-700 font-medium">{p.orderReference || p.orderId?.slice(-8)}</td>
                  <td className="px-5 py-4 text-right text-ink-700">₦{p.saleAmount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-ink-500">
                    ₦{p.commissionAmount.toLocaleString()} <span className="text-[11px]">({Math.round(p.commissionRate * 100)}%)</span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-green-700">₦{p.vendorAmount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-ink-400 text-xs">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                      : new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
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
