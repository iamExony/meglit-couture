"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import ProductCard from "@/components/ProductCard";

export default function FavoritesPage() {
  const { customer, loading } = useCustomerAuth();
  const { ids, loading: favLoading } = useFavorites();
  const router = useRouter();
  const products = useQuery(api.products.list, {});

  useEffect(() => {
    if (!loading && !customer) router.replace("/signin?next=/account/favorites");
  }, [customer, loading, router]);

  const favoriteProducts = useMemo(() => {
    if (!products) return null;
    const set = new Set(ids.map(String));
    return products.filter((p) => set.has(String(p._id || p.id || p.slug)));
  }, [products, ids]);

  if (loading || !customer) {
    return <div className="min-h-[60vh] flex items-center justify-center text-ink-400 text-sm">Loading…</div>;
  }

  return (
    <div className="bg-brand-50 min-h-[70vh] py-12">
      <div className="container-custom max-w-6xl">
        <Link href="/account" className="text-xs text-ink-500 hover:text-brand-950 uppercase tracking-[0.15em]">← Account</Link>
        <h1 className="text-2xl font-semibold text-brand-950 mt-2 mb-6">Favorites</h1>

        {favLoading || favoriteProducts === null ? (
          <div className="text-sm text-ink-400">Loading favorites…</div>
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-white border border-brand-100 rounded-xl p-10 text-center">
            <div className="text-sm text-ink-500 mb-4">You haven't favorited anything yet.</div>
            <Link href="/shop" className="inline-block bg-brand-950 text-white text-xs uppercase tracking-[0.15em] px-5 py-3 rounded">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((p) => (
              <ProductCard key={p._id || p.id || p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
