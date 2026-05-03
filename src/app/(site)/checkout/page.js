"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/data/products";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { customer, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    note: "",
  });

  // Login gate: redirect to /signin and come back here after sign-in.
  useEffect(() => {
    if (!authLoading && !customer) {
      router.replace("/signin?next=/checkout");
    }
  }, [customer, authLoading, router]);

  // Prefill from signed-in customer profile.
  useEffect(() => {
    if (!customer) return;
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || customer.firstName || "",
      lastName: prev.lastName || customer.lastName || "",
      email: prev.email || customer.email || "",
      phone: prev.phone || customer.phone || "",
    }));
  }, [customer]);

  const shipping = cartTotal >= 50000 ? 0 : 3000;
  const total = cartTotal + shipping;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaystack = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!window.PaystackPop) {
      alert("Payment library is still loading — please wait a moment and try again.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert("Payment is not configured. Please contact support.");
      return;
    }

    setLoading(true);

    // Generate a stable reference up-front so it matches across:
    // - the order saved in Convex (status: pending)
    // - the Paystack transaction
    // - the webhook (Paystack -> server)
    // - the verify call (server -> Paystack)
    const reference = `MGL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const orderPayload = {
      reference,
      items: items.map((item) => ({
        id: item.id,
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        images: item.images,
      })),
      subtotal: cartTotal,
      shipping,
      total,
      customer: {
        ...formData,
        ...(customer ? { customerId: customer.id, email: customer.email || formData.email } : {}),
      },
      paymentStatus: "pending",
      status: "pending",
    };

    // 1) Persist a pending order BEFORE opening Paystack so we always have a record.
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Order create failed (${res.status})`);
      }
    } catch (err) {
      setLoading(false);
      alert(`Could not save your order. ${err.message || ""}`.trim());
      return;
    }

    // Stash a local copy so the confirmation page works offline / before verify completes.
    try {
      localStorage.setItem(
        "meglit-last-order",
        JSON.stringify({ ...orderPayload, date: new Date().toISOString() })
      );
    } catch {}

    // 2) Open Paystack popup
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: formData.email,
      amount: total * 100, // kobo
      currency: "NGN",
      ref: reference,
      metadata: {
        order_reference: reference,
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: `${formData.firstName} ${formData.lastName}` },
          { display_name: "Phone", variable_name: "phone", value: formData.phone },
          { display_name: "Address", variable_name: "address", value: `${formData.address}, ${formData.city}, ${formData.state}` },
        ],
      },
      callback: function (response) {
        // 3) Server-side verify, then redirect. This is the source of truth
        // (the webhook is a backup if the user closes the tab before verify resolves).
        (async () => {
          try {
            await fetch(`/api/paystack/verify?reference=${encodeURIComponent(response.reference)}`, {
              method: "GET",
              cache: "no-store",
            });
          } catch {
            // Webhook will catch up regardless.
          }
          clearCart();
          router.push(`/order-confirmation?ref=${response.reference}`);
        })();
      },
      onClose: function () {
        setLoading(false);
      },
    });

    handler.openIframe();
  };

  if (items.length === 0) {
    return (
      <section className="section-padding bg-brand-50 min-h-screen" id="checkout-empty">
        <div className="container-custom text-center py-20">
          <h1 className="font-heading text-3xl font-bold text-brand-950 mb-4">Your Cart is Empty</h1>
          <p className="text-ink-500 text-sm mb-8">Add some items before checking out.</p>
          <Link href="/shop" className="btn-primary">Shop Now</Link>
        </div>
      </section>
    );
  }

  if (authLoading || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-400 text-sm">
        Redirecting to sign in…
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-brand-200 text-sm focus:outline-none focus:border-brand-950 transition-colors";
  const labelClass = "block text-xs font-medium text-ink-700 mb-1.5";

  return (
    <>
      {/* Paystack Script */}
      <script src="https://js.paystack.co/v1/inline.js" async />

      {/* Header */}
      <div className="bg-brand-950 py-12" id="checkout-header">
        <div className="container-custom">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white text-center">Checkout</h1>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-brand-400 tracking-wider uppercase">
            <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
            <span className="text-brand-600">→</span>
            <span className="text-accent-400 font-medium">Checkout</span>
            <span className="text-brand-600">→</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <section className="section-padding bg-brand-50" id="checkout-form-section">
        <div className="container-custom">
          <form onSubmit={handlePaystack}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Info */}
                <div className="bg-white border border-brand-100 p-6" id="contact-info">
                  <h2 className="font-heading text-lg font-bold text-brand-950 mb-6">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Enter first name" />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Enter last name" />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number *</label>
                      <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+234 800 000 0000" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-brand-100 p-6" id="shipping-address">
                  <h2 className="font-heading text-lg font-bold text-brand-950 mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Street Address *</label>
                      <input name="address" type="text" required value={formData.address} onChange={handleChange} className={inputClass} placeholder="Enter your street address" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>City *</label>
                        <input name="city" type="text" required value={formData.city} onChange={handleChange} className={inputClass} placeholder="Enter city" />
                      </div>
                      <div>
                        <label className={labelClass}>State *</label>
                        <select name="state" required value={formData.state} onChange={handleChange} className={inputClass}>
                          <option value="">Select state</option>
                          {["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Order Note (optional)</label>
                      <textarea name="note" rows={3} value={formData.note} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Special instructions for your order..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white border border-brand-100 p-6 sticky top-24" id="checkout-summary">
                  <h2 className="font-heading text-lg font-bold text-brand-950 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-14 h-18 bg-brand-100 overflow-hidden flex-shrink-0">
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-ink-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-ink-400">{item.selectedSize} / {item.selectedColor}</p>
                          <p className="text-[10px] text-ink-400">Qty: {item.quantity}</p>
                          <p className="text-xs font-bold text-brand-950">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-brand-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-500">Subtotal</span>
                      <span className="font-medium text-ink-800">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-500">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? <span className="text-accent-600">Free</span> : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="border-t border-brand-100 pt-3 flex justify-between">
                      <span className="font-semibold text-ink-800">Total</span>
                      <span className="text-xl font-bold text-brand-950">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="pay-button"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Pay {formatPrice(total)} with Paystack
                      </>
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-[11px] text-ink-400 flex items-center justify-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Secured by Paystack
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {["Visa", "Mastercard", "Bank Transfer"].map((m) => (
                        <span key={m} className="text-[10px] text-ink-400 px-2 py-0.5 border border-brand-200">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
