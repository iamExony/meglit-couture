import Link from "next/link";
import { categories } from "@/data/products";

export default function CategorySection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-gold-600 text-sm tracking-[0.2em] uppercase">Explore</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-royal-900 mt-2">
            Shop by Category
          </h2>
          <div className="w-20 h-0.5 bg-gold-500 mx-auto mt-4" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={cat.id === "new" ? "/shop?filter=new" : `/shop?category=${cat.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-royal-950/80 via-royal-950/20 to-transparent group-hover:from-royal-950/90 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-300 mb-3">{cat.description}</p>
                <span className="inline-flex items-center text-gold-400 text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                  Shop Now ({cat.count})
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
