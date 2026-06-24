"use client";
import { useEffect, useState } from "react";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/vendor/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
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
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-950">Orders</h1>
        <p className="text-ink-500 text-sm mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} containing your products</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-lg p-12 text-center">
          <svg className="w-10 h-10 text-ink-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          <p className="text-ink-500 font-medium mb-1">No orders yet</p>
          <p className="text-ink-400 text-sm">Orders containing your products will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isOpen = expanded === order._id;
            const itemTotal = (order.items || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

            return (
              <div key={order._id} className="bg-white border border-brand-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-ink-800 text-sm">
                        Order #{order.legacyId || order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        {" · "}
                        ₦{itemTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || "bg-ink-100 text-ink-600"}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Unknown"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-brand-100 px-5 py-4">
                    {/* Customer info */}
                    {order.customer && (
                      <div className="mb-4 text-sm">
                        <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Customer</p>
                        <p className="text-ink-700 font-medium">{order.customer.name || "—"}</p>
                        <p className="text-ink-500 text-xs">{order.customer.email || ""}</p>
                        {order.shippingAddress && (
                          <p className="text-ink-500 text-xs mt-0.5">
                            {[order.shippingAddress.address, order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">Your Items in This Order</p>
                    <div className="space-y-3">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-9 h-9 object-cover border border-brand-100 rounded flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 bg-brand-100 rounded flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-ink-800">{item.name || "Product"}</p>
                              {(item.size || item.color) && (
                                <p className="text-xs text-ink-400">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-medium text-ink-800">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                            <p className="text-xs text-ink-400">×{item.quantity || 1} @ ₦{(item.price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-ink-700">Your Subtotal</span>
                      <span className="text-sm font-bold text-brand-950">₦{itemTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
