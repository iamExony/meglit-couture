"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, cartTotal } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white z-50 transform transition-transform duration-300 shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        id="cart-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-brand-100">
            <h2 className="font-heading text-lg font-bold text-brand-950">
              Your Cart ({items.length})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 text-ink-400 hover:text-ink-800 transition-colors"
              aria-label="Close cart"
              id="close-cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-14 h-14 mx-auto text-ink-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-ink-500 mb-4 text-sm">Your cart is empty</p>
                <button onClick={closeCart} className="btn-primary text-xs">
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                  <div className="w-20 h-24 bg-brand-100 overflow-hidden flex-shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-ink-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-ink-400 mt-1">
                      {item.selectedSize} / {item.selectedColor}
                    </p>
                    <p className="text-sm font-bold text-brand-950 mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-7 h-7 border border-brand-200 flex items-center justify-center text-ink-600 hover:border-brand-950 hover:text-brand-950 transition-colors text-xs"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-7 h-7 border border-brand-200 flex items-center justify-center text-ink-600 hover:border-brand-950 hover:text-brand-950 transition-colors text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(index)}
                        className="ml-auto text-ink-300 hover:text-accent-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-brand-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-ink-600 text-sm">Subtotal</span>
                <span className="text-lg font-bold text-brand-950">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="text-[11px] text-ink-400">
                Shipping & taxes calculated at checkout
              </p>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-secondary block text-center w-full"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary block text-center w-full"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
