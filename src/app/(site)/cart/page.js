"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

export default function CartPage() {
  const { items, removeItem, updateQuantity, cartTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="section-padding bg-brand-50 min-h-screen" id="cart-empty">
        <div className="container-custom text-center py-20">
          <svg className="w-20 h-20 mx-auto text-ink-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="font-heading text-3xl font-bold text-brand-950 mb-4">Your Cart is Empty</h1>
          <p className="text-ink-500 text-sm mb-8">Looks like you haven&apos;t added any items yet.</p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  const shipping = cartTotal >= 50000 ? 0 : 3000;
  const total = cartTotal + shipping;

  return (
    <>
      {/* Header */}
      <div className="bg-brand-950 py-12" id="cart-header">
        <div className="container-custom">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white text-center">Shopping Cart</h1>
        </div>
      </div>

      <section className="section-padding bg-brand-50" id="cart-content">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-semibold text-ink-400 uppercase tracking-[0.12em]">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white border border-brand-100 p-4 md:p-6">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      <div className="w-20 h-24 bg-brand-100 overflow-hidden flex-shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={`/product/${item.id}`} className="text-sm font-medium text-ink-800 hover:text-brand-950 transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-xs text-ink-400 mt-1">Size: {item.selectedSize}</p>
                        <p className="text-xs text-ink-400">Color: {item.selectedColor}</p>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-[11px] text-accent-600 hover:text-accent-800 mt-2 transition-colors font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-4 md:col-span-2 text-center">
                      <span className="md:hidden text-[10px] text-ink-400 block">Price</span>
                      <span className="text-sm font-medium text-ink-800">{formatPrice(item.price)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 md:col-span-2 flex justify-center">
                      <div className="flex items-center border border-brand-200">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="px-3 py-1.5 text-ink-600 hover:text-brand-950 text-xs"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 font-medium text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-3 py-1.5 text-ink-600 hover:text-brand-950 text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-4 md:col-span-2 text-right">
                      <span className="md:hidden text-[10px] text-ink-400 block">Total</span>
                      <span className="text-sm font-bold text-brand-950">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4">
                <Link href="/shop" className="text-xs text-brand-950 font-medium hover:underline flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Continue Shopping
                </Link>
                <button onClick={clearCart} className="text-xs text-accent-600 font-medium hover:text-accent-800 transition-colors">
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white border border-brand-100 p-6 sticky top-24" id="order-summary">
                <h2 className="font-heading text-lg font-bold text-brand-950 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Subtotal ({items.length} items)</span>
                    <span className="font-medium text-ink-800">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-accent-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-ink-400">
                      Free shipping on orders over ₦50,000
                    </p>
                  )}
                  <div className="border-t border-brand-100 pt-3 flex justify-between">
                    <span className="font-semibold text-ink-800">Total</span>
                    <span className="text-xl font-bold text-brand-950">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="flex-1 px-4 py-2.5 border border-brand-200 text-xs focus:outline-none focus:border-brand-950"
                      id="coupon-input"
                    />
                    <button className="px-4 py-2.5 bg-brand-50 text-xs font-medium text-ink-700 hover:bg-brand-100 transition-colors" id="apply-coupon">
                      Apply
                    </button>
                  </div>
                </div>

                <Link href="/checkout" className="btn-primary block text-center w-full py-4" id="proceed-checkout">
                  Proceed to Checkout
                </Link>

                {/* Trust badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-ink-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Secure Checkout
                  </span>
                  <span>Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
