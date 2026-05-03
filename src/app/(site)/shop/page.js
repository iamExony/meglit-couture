"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const products = useQuery(api.products.list, {});
  const categories = useQuery(api.categories.list, {}) || [];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // New arrivals filter
    if (filterParam === "new") {
      result = result.filter((p) => p.newArrival);
    }

    // Price range filter
    if (priceRange === "under-20k") result = result.filter((p) => p.price < 20000);
    else if (priceRange === "20k-35k") result = result.filter((p) => p.price >= 20000 && p.price <= 35000);
    else if (priceRange === "35k-50k") result = result.filter((p) => p.price >= 35000 && p.price <= 50000);
    else if (priceRange === "above-50k") result = result.filter((p) => p.price > 50000);

    // Sorting
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest") result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));

    return result;
  }, [products, selectedCategory, sortBy, priceRange, filterParam]);

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-950 py-16 md:py-20" id="shop-hero">
        <div className="container-custom text-center">
          <span className="text-accent-400 text-xs font-semibold tracking-[0.25em] uppercase">
            Shop
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mt-3 mb-3">
            Our Collection
          </h1>
          <p className="text-brand-300 text-sm">Discover your perfect style</p>
        </div>
      </section>

      <section className="section-padding bg-brand-50" id="shop-products">
        <div className="container-custom">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category tabs */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-brand-950 text-white"
                    : "bg-white text-ink-600 hover:text-brand-950 border border-brand-200"
                }`}
                id="filter-all"
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-brand-950 text-white"
                      : "bg-white text-ink-600 hover:text-brand-950 border border-brand-200"
                  }`}
                  id={`filter-${cat.slug}`}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-[11px] text-ink-600 bg-white border border-brand-200 hover:text-brand-950 transition-colors md:hidden"
                id="toggle-filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-ink-400">{filteredProducts.length} products</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 text-xs bg-white border border-brand-200 focus:outline-none focus:border-brand-950 text-ink-700"
                id="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-52 flex-shrink-0`}>
              <div className="bg-white p-6 border border-brand-100 sticky top-24">
                <h3 className="font-heading text-base font-semibold text-brand-950 mb-5">Filters</h3>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-semibold text-ink-700 mb-3 uppercase tracking-[0.12em]">Price Range</h4>
                  {[
                    { value: "all", label: "All Prices" },
                    { value: "under-20k", label: "Under ₦20,000" },
                    { value: "20k-35k", label: "₦20,000 - ₦35,000" },
                    { value: "35k-50k", label: "₦35,000 - ₦50,000" },
                    { value: "above-50k", label: "Above ₦50,000" },
                  ].map((range) => (
                    <label key={range.value} className="flex items-center gap-2 mb-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === range.value}
                        onChange={() => setPriceRange(range.value)}
                        className="accent-brand-950 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-ink-600">{range.label}</span>
                    </label>
                  ))}
                </div>

                {/* Reset */}
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange("all");
                    setSortBy("featured");
                  }}
                  className="text-xs text-brand-950 font-medium underline underline-offset-2 hover:no-underline"
                  id="reset-filters"
                >
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-14 h-14 mx-auto text-ink-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="font-heading text-xl text-ink-600 mb-2">No products found</h3>
                  <p className="text-ink-400 text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
