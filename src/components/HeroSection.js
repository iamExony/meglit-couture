import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-brand-50" id="hero-section">
      <div className="container-custom w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 py-12 lg:py-0">
            <span className="section-label animate-fade-in-up">
              New Collection 2026
            </span>
            <h1
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-brand-950 leading-[1.1] mt-4 mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              Elegance in <br />
              Every Drape
            </h1>
            <p
              className="text-base md:text-lg text-ink-500 leading-relaxed mb-10 max-w-md animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              Discover our exclusive palazzo collections and premium branded
              fabrics, handcrafted for the modern woman who commands attention.
            </p>
            <div
              className="flex flex-wrap gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              <Link href="/shop" className="btn-primary px-10 py-4">
                Shop Collection
              </Link>
              <Link href="/shop?category=Fabrics" className="btn-secondary px-10 py-4">
                View Fabrics
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex gap-10 mt-14 pt-8 border-t border-brand-200 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              {[
                { value: "500+", label: "Happy Clients" },
                { value: "100+", label: "Unique Designs" },
                { value: "50+", label: "Premium Fabrics" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block text-2xl md:text-3xl font-bold text-brand-950 font-heading">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-ink-400 uppercase tracking-[0.12em] mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative animate-fade-in">
            <div className="aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-brand-100">
              <img
                src="/images/hero-main.png"
                alt="Meglit Couture - Elegant palazzo fashion"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative accent */}
            <div className="hidden lg:block absolute -bottom-4 -left-4 w-24 h-24 border-2 border-accent-400" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
