"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/data/products";

function OrderContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [order, setOrder] = useState(null);
  const [serverOrder, setServerOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Show local copy immediately for fast paint.
    try {
      const saved = localStorage.getItem("meglit-last-order");
      if (saved) setOrder(JSON.parse(saved));
    } catch {}

    // 2) Fetch the authoritative order from the server, polling briefly so the
    //    Paystack verify call (and webhook) have a chance to flip status -> paid.
    if (!ref) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8; // ~12s total

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(ref)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.order) {
            setServerOrder(data.order);
            // Stop early once payment is confirmed
            if (data.order.status === "paid" || data.order.paymentStatus === "paid") {
              setLoading(false);
              return;
            }
          }
        }
      } catch {}
      if (!cancelled && attempts < maxAttempts) {
        setTimeout(poll, 1500);
      } else if (!cancelled) {
        setLoading(false);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [ref]);

  // Prefer server order; fall back to localStorage snapshot.
  const display = serverOrder
    ? {
        reference: serverOrder.reference || serverOrder._id,
        items: serverOrder.items || [],
        total: serverOrder.total || 0,
        shipping: serverOrder.shipping || 0,
        subtotal: serverOrder.subtotal ?? (serverOrder.total - (serverOrder.shipping || 0)),
        customer: serverOrder.customer || {},
        status: serverOrder.status,
        paymentStatus: serverOrder.paymentStatus,
      }
    : order
    ? {
        reference: order.reference,
        items: order.items || [],
        total: order.total || 0,
        shipping: order.shipping || 0,
        subtotal: order.subtotal ?? (order.total - (order.shipping || 0)),
        customer: order.customer || {},
        status: order.status || "pending",
        paymentStatus: order.paymentStatus || "pending",
      }
    : null;

  if (!display) {
    return (
      <section className="section-padding bg-brand-50 min-h-screen" id="order-not-found">
        <div className="container-custom text-center py-20">
          <h1 className="font-heading text-3xl font-bold text-brand-950 mb-4">No Order Found</h1>
          <p className="text-ink-500 text-sm mb-8">We couldn&apos;t find your order details.</p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  const isPaid = display.status === "paid" || display.paymentStatus === "paid";
  const isFailed = display.status === "failed" || display.paymentStatus === "failed";

  return (
    <>
      {/* Header */}
      <div className="bg-brand-950 py-12" id="confirmation-header">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 text-xs text-brand-400 tracking-wider uppercase mb-4">
            <span>Cart</span>
            <span className="text-brand-600">→</span>
            <span>Checkout</span>
            <span className="text-brand-600">→</span>
            <span className="text-accent-400 font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      <section className="section-padding bg-brand-50" id="order-details">
        <div className="container-custom max-w-3xl">
          {/* Success */}
          <div className="bg-white border border-brand-100 p-8 md:p-12 text-center mb-6">
            <div className={`w-16 h-16 flex items-center justify-center mx-auto mb-6 ${isPaid ? "bg-accent-50" : isFailed ? "bg-red-50" : "bg-amber-50"}`}>
              {isPaid ? (
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isFailed ? (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-950 mb-3">
              {isPaid ? "Thank You for Your Order!" : isFailed ? "Payment Failed" : loading ? "Confirming Payment…" : "Order Received"}
            </h1>
            <p className="text-ink-500 text-sm mb-2">
              {isPaid ? (
                <>Your order has been placed successfully. We&apos;ve sent a confirmation to{" "}
                <span className="font-semibold text-brand-950">{display.customer.email}</span></>
              ) : isFailed ? (
                <>We could not process your payment. Please try again or contact support.</>
              ) : (
                <>We&apos;re confirming your payment with Paystack — this usually takes a few seconds.</>
              )}
            </p>
            <div className="inline-block mt-4 px-6 py-3 bg-brand-50">
              <p className="text-xs text-ink-400">Order Reference</p>
              <p className="text-base font-bold text-brand-950 font-mono tracking-wider">{ref || display.reference}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white border border-brand-100 p-6 md:p-8 mb-6">
            <h2 className="font-heading text-lg font-bold text-brand-950 mb-6">Order Details</h2>

            <div className="space-y-4 mb-6">
              {display.items.map((item, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-brand-100 last:border-0">
                  <div className="w-14 h-18 bg-brand-100 overflow-hidden flex-shrink-0">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-800">{item.name}</p>
                    <p className="text-xs text-ink-400">
                      {(item.size || item.selectedSize) ?? ""}{(item.size || item.selectedSize) && (item.color || item.selectedColor) ? " / " : ""}{(item.color || item.selectedColor) ?? ""} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-brand-950">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Subtotal</span>
                <span className="text-ink-800">{formatPrice(display.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Shipping</span>
                <span className="text-ink-800">{display.shipping === 0 ? "Free" : formatPrice(display.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-brand-100 pt-2">
                <span>{isPaid ? "Total Paid" : "Total"}</span>
                <span className="text-brand-950">{formatPrice(display.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white border border-brand-100 p-6 md:p-8 mb-6">
            <h2 className="font-heading text-lg font-bold text-brand-950 mb-4">Shipping Information</h2>
            <div className="text-sm text-ink-500 space-y-1">
              <p className="font-medium text-ink-800">
                {display.customer.firstName} {display.customer.lastName}
              </p>
              <p>{display.customer.address}</p>
              <p>{display.customer.city}, {display.customer.state}</p>
              <p>{display.customer.phone}</p>
              <p>{display.customer.email}</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-brand-100 p-6 md:p-8 mb-8" id="whats-next">
            <h2 className="font-heading text-lg font-bold text-brand-950 mb-5">What Happens Next?</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Order Confirmed", desc: "We've received your order and payment." },
                { step: "2", title: "Processing", desc: "Your items are being carefully prepared." },
                { step: "3", title: "Shipped", desc: "Your package will be dispatched within 1-3 business days." },
                { step: "4", title: "Delivered", desc: "Estimated delivery: 3-7 business days." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-brand-950 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">{item.title}</p>
                    <p className="text-xs text-ink-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary text-center">
              Continue Shopping
            </Link>
            <Link href="/" className="btn-secondary text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderContent />
    </Suspense>
  );
}
