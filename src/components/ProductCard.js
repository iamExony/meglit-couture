"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { customer } = useCustomerAuth();
  const router = useRouter();
  const productKey = String(product._id || product.id || product.slug || "");
  const favorited = isFavorite(productKey);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customer) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    await toggle(productKey);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes?.[0];
    const colorRaw = product.colors?.[0];
    const color = typeof colorRaw === "string" ? colorRaw : colorRaw?.name;
    addItem(product, size, color);
  };

  return (
    <div className="group card-lift rounded-sm" id={`product-card-${product._id || product.id}`}>
      <Link href={`/product/${product.slug || product._id || product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-100 mb-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-300 text-xs uppercase tracking-wider">No image</div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className="bg-brand-950 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-accent-600 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick Add - Slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white text-brand-950 py-2.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-brand-950 hover:text-white transition-colors"
            >
              Quick Add
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-accent-50 ${favorited ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <svg className={`w-4 h-4 ${favorited ? "text-accent-600" : "text-ink-500 hover:text-accent-600"}`} fill={favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] text-accent-600 uppercase tracking-[0.15em] font-medium mb-1">
            {product.category || "Product"}
          </p>
          <h3 className="text-sm font-medium text-ink-800 group-hover:text-brand-950 transition-colors mb-1.5 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-accent-500" : "text-ink-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[10px] text-ink-400 ml-0.5">({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-950">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-ink-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
