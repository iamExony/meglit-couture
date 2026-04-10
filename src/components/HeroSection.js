import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80"
          alt="Fashion background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-royal-950/90 via-royal-900/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container-custom z-10">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-2 bg-gold-600/20 border border-gold-400/30 text-gold-400 text-xs tracking-[0.2em] uppercase rounded-sm mb-6 animate-fade-in-up">
            New Collection 2026
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Elegance in <br />
            <span className="text-gold-400">Every Drape</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-lg animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            Discover our exclusive palazzo collections and premium branded fabrics, handcrafted for the modern woman who commands attention.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link href="/shop" className="btn-gold text-base px-10 py-4">
              Shop Collection
            </Link>
            <Link href="/shop?category=fabric" className="border-2 border-white/30 text-white px-10 py-4 rounded-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300 uppercase text-sm">
              View Fabrics
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-16 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            {[
              { value: "500+", label: "Happy Clients" },
              { value: "100+", label: "Unique Designs" },
              { value: "50+", label: "Premium Fabrics" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="block text-2xl md:text-3xl font-bold text-gold-400">{stat.value}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
