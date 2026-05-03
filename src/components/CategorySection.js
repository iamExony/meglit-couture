"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Reveal from "./Reveal";

export default function CategorySection() {
  const categoryImages = {
    palazzo: "/images/category-palazzo.png",
    fabric: "/images/category-fabrics.png",
  };

  const categories = useQuery(api.categories.list, {}) || [];
  const products = useQuery(api.products.list, {}) || [];

  const items = useMemo(() => {
    const counts = new Map();
    for (const p of products) {
      const k = String(p.category || "").toLowerCase();
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    // Show up to 4 categories with the highest product counts (or first 4 if all zero).
    return [...categories]
      .map((c) => ({
        ...c,
        slug: c.slug || String(c.name || "").toLowerCase(),
        count: counts.get(String(c.slug || c.name || "").toLowerCase()) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [categories, products]);

  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-white" id="category-section">
      <div className="container-custom">
        {/* Header */}
        <Reveal className="text-center mb-14">
          <span className="section-label">Explore</span>
          <h2 className="section-title">Shop by Category</h2>
          <div className="section-divider" />
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((cat, i) => (
            <Reveal key={cat._id || cat.slug} delay={i * 80}>
              <Link
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group block card-lift"
                id={`category-${cat.slug}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-100 mb-4">
                  <img
                    src={categoryImages[cat.slug] || cat.image || "/images/placeholder.png"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-brand-950/80 to-transparent transition-opacity duration-300 group-hover:from-brand-950/95" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-flex items-center text-accent-400 text-[11px] font-medium tracking-wider uppercase gap-1 group-hover:gap-3 transition-all duration-300">
                      Shop Now ({cat.count})
                      <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
                <h3 className="font-heading text-lg font-semibold text-brand-950 mb-1 group-hover:text-accent-700 transition-colors">
                  {cat.name}
                </h3>
                {cat.description ? (
                  <p className="text-sm text-ink-400">{cat.description}</p>
                ) : null}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
