"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import TryOnModal from "@/components/TryOnModal";

export default function ProductDetailPage() {
  const params = useParams();
  const allProducts = useQuery(api.products.list, {});
  const key = String(params.id);
  const product = (allProducts || []).find(
    (p) => p.slug === key || p._id === key || String(p.legacyId) === key
  );
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showNotice, setShowNotice] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);

  if (allProducts === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-brand-950 mb-4">Product Not Found</h1>
          <Link href="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockLeft = Math.max(0, Number(product.stock) || 0);
  const isOutOfStock = stockLeft <= 0;
  const cappedQty = Math.min(quantity, Math.max(1, stockLeft || 1));

  const relatedProducts = (allProducts || [])
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const hasColors = (product.colors || []).some((c) => normalizeProductColor(c));
  const hasSizes = (product.sizes || []).length > 0;

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3000);
      return;
    }
    if (hasColors && !selectedColor) {
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3000);
      return;
    }
    if (isOutOfStock) return;
    addItem(product, selectedSize, selectedColor, cappedQty);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-brand-50 py-4 border-b border-brand-100" id="product-breadcrumb">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-xs text-ink-400">
            <Link href="/" className="hover:text-brand-950 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-950 transition-colors">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-brand-950 transition-colors capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-brand-950">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="section-padding bg-white" id="product-detail">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Images */}
            <div className="space-y-3">
              <div className="aspect-[3/4] bg-brand-100 overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-brand-100 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-brand-950" : "border-transparent"
                    }`}
                    id={`product-thumb-${i}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="lg:py-4">
              <div className="flex items-center gap-2 mb-3">
                {product.badge && (
                  <span className="bg-brand-950 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium">
                    {product.badge}
                  </span>
                )}
                {product.newArrival && (
                  <span className="bg-accent-600 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium">
                    New Arrival
                  </span>
                )}
              </div>

              <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-950 mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-accent-500" : "text-ink-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-ink-400">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold text-brand-950">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-ink-400 line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="bg-accent-50 text-accent-700 text-xs font-semibold px-3 py-1">
                      -{discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-ink-500 text-sm leading-relaxed mb-8">{product.description}</p>

              {/* Notice */}
              {showNotice && (
                <div className="bg-accent-50 border border-accent-200 text-accent-800 text-sm px-4 py-3 mb-4">
                  Please select a size and color before adding to cart.
                </div>
              )}

              {/* Size Select */}
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold text-ink-700 mb-3 uppercase tracking-[0.12em]">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 text-xs border transition-colors min-w-[56px] ${
                        selectedSize === size
                          ? "border-brand-950 bg-brand-950 text-white"
                          : "border-brand-200 text-ink-700 hover:border-brand-950"
                      }`}
                      id={`size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <SizeMeasurementsDisplay
                  size={selectedSize}
                  measurements={product.sizeMeasurements}
                />
              </div>

              {/* Color Select */}
              {hasColors && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-semibold text-ink-700 mb-3 uppercase tracking-[0.12em]">
                    Color
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const c = normalizeProductColor(color);
                      if (!c) return null;
                      const isActive = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs border transition-colors ${
                            isActive
                              ? "border-brand-950 bg-brand-50 text-brand-950"
                              : "border-brand-200 text-ink-700 hover:border-brand-950"
                          }`}
                          id={`color-${c.name.replace(/\s+/g, "-")}`}
                        >
                          {c.hex && (
                            <span
                              className="inline-block w-4 h-4 rounded-full border border-brand-200"
                              style={{ backgroundColor: c.hex }}
                            />
                          )}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center border border-brand-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, cappedQty - 1))}
                    disabled={isOutOfStock || cappedQty <= 1}
                    className="px-4 py-3 text-ink-600 hover:text-brand-950 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    id="qty-minus"
                  >
                    −
                  </button>
                  <span className="px-4 py-3 font-medium min-w-[48px] text-center text-sm">{cappedQty}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockLeft || 1, cappedQty + 1))}
                    disabled={isOutOfStock || cappedQty >= stockLeft}
                    className="px-4 py-3 text-ink-600 hover:text-brand-950 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    id="qty-plus"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="add-to-cart"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
              <div className="text-xs mb-6 " >
                {isOutOfStock ? (
                  <span className="text-red-600 font-medium">Currently sold out.</span>
                ) : stockLeft <= 10 ? (
                  <span className="text-amber-700">Only {stockLeft} left in stock.</span>
                ) : (
                  <span className="text-ink-500">In stock</span>
                )}
              </div>

              {/* Virtual Try-On */}
              <button
                onClick={() => setShowTryOn(true)}
                className="w-full border border-accent-500 text-accent-600 text-sm font-semibold uppercase tracking-wider py-4 mb-3 flex items-center justify-center gap-2 hover:bg-accent-50 transition-colors"
                id="try-on-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Virtual Try-On
              </button>

              {/* Buy Now */}
              <Link
                href={(!hasSizes || selectedSize) && (!hasColors || selectedColor) ? "/checkout" : "#"}
                onClick={(e) => {
                  if ((hasSizes && !selectedSize) || (hasColors && !selectedColor)) {
                    e.preventDefault();
                    setShowNotice(true);
                    setTimeout(() => setShowNotice(false), 3000);
                    return;
                  }
                  addItem(product, selectedSize, selectedColor, cappedQty);
                }}
                className="btn-accent block text-center w-full py-4 mb-8"
                id="buy-now"
              >
                Buy Now
              </Link>

              {/* Extra Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-brand-100 pt-8">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    ),
                    label: "Free Delivery",
                    sub: "Orders over ₦50k",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                      </svg>
                    ),
                    label: "Easy Returns",
                    sub: "7-day policy",
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    ),
                    label: "Secure Payment",
                    sub: "Powered by Paystack",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="text-brand-700">{item.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-ink-800">{item.label}</p>
                      <p className="text-[11px] text-ink-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16 border-t border-brand-100 pt-12">
            <div className="flex gap-8 border-b border-brand-200 mb-8">
              {["description", "details", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors border-b-2 ${
                    activeTab === tab
                      ? "text-brand-950 border-brand-950"
                      : "text-ink-400 border-transparent hover:text-ink-700"
                  }`}
                  id={`tab-${tab}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "description" && (
              <div className="max-w-3xl">
                <p className="text-ink-500 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === "details" && (
              <ul className="max-w-md space-y-3">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-3 text-ink-600 text-sm">
                    <svg className="w-4 h-4 text-accent-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-accent-500" : "text-ink-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-heading font-bold text-brand-950">{product.rating} out of 5</p>
                <p className="text-ink-400 text-sm mt-1">Based on {product.reviews} reviews</p>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-950 mb-8 text-center">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <TryOnModal
        product={product}
        isOpen={showTryOn}
        onClose={() => setShowTryOn(false)}
      />
    </>
  );
}

const MEASUREMENT_LABELS = {
  Wst: "Waist",
  Hps: "Hips",
  Bst: "Bust",
  Lgth: "Length",
  Wdth: "Width",
  Insm: "Inseam",
  Otsm: "Outseam",
  Shldr: "Shoulder",
};

function normalizeProductColor(c) {
  if (!c) return null;
  if (typeof c === "string") {
    const t = c.trim();
    if (!t) return null;
    const m = t.match(/^(.+?)\s*[|:]\s*(#[0-9a-fA-F]{3,8})$/);
    return m ? { name: m[1].trim(), hex: m[2] } : { name: t, hex: "" };
  }
  if (typeof c === "object" && c.name) return { name: String(c.name), hex: String(c.hex || "") };
  return null;
}

function SizeMeasurementsDisplay({ size, measurements }) {
  if (!size || !measurements || typeof measurements !== "object") return null;
  const m = measurements[size];
  if (!m || typeof m !== "object") return null;
  const entries = Object.entries(m).filter(([, v]) => v !== "" && v !== null && v !== undefined);
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 bg-brand-50 border border-brand-100 rounded p-3">
      <div className="text-[10px] uppercase tracking-[0.12em] text-ink-500 mb-2">
        Size {size} measurements (inches)
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
        {entries.map(([key, value]) => {
          const str = String(value);
          const display = /[a-zA-Z"]/.test(str) ? str : `${str}"`;
          return (
            <div key={key} className="flex justify-between gap-2">
              <dt className="text-ink-500">{MEASUREMENT_LABELS[key] || key}</dt>
              <dd className="font-medium text-brand-950">{display}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
