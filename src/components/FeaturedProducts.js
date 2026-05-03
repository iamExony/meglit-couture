"use client";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function FeaturedProducts() {
  const allProducts = useQuery(api.products.list, {}) || [];
  const flagged = allProducts.filter((p) => p.featured);
  // Fall back to most recent products so the homepage is never empty.
  const featured = (flagged.length > 0 ? flagged : allProducts).slice(0, 8);

  return (
    <section className="section-padding bg-brand-50" id="featured-section">
      <div className="container-custom">
        {/* Header */}
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="section-label">Curated for You</span>
            <h2 className="section-title !mb-0">Featured Collection</h2>
          </div>
          <Link
            href="/shop"
            className="text-[11px] font-medium text-brand-950 uppercase tracking-[0.15em] border-b border-brand-950 pb-0.5 hover:border-accent-500 hover:text-accent-600 transition-colors link-underline"
          >
            View All
          </Link>
        </Reveal>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product, i) => (
            <Reveal key={product._id} delay={i * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
