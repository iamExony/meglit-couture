import Link from "next/link";
import Newsletter from "@/components/Newsletter";

export const metadata = {
  title: "About Us | Meglit Couture",
  description: "Learn about Meglit Couture - our story, mission, and commitment to redefining African fashion.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-950 py-16 md:py-20" id="about-hero">
        <div className="container-custom text-center">
          <span className="text-accent-400 text-xs font-semibold tracking-[0.25em] uppercase">
            Our Story
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mt-3">
            About Meglit Couture
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-white" id="about-story">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="section-label">Who We Are</span>
              <h2 className="section-title">
                Where Elegance Meets African Craftsmanship
              </h2>
              <div className="space-y-4 text-ink-500 leading-relaxed text-sm">
                <p>
                  Founded with a passion for redefining contemporary African fashion, Meglit Couture has become
                  a premier destination for women who appreciate quality, elegance, and distinctive style.
                </p>
                <p>
                  Our journey began with a simple vision: to create palazzo wears and curate fabrics that
                  empower women to express their unique sense of style. Every piece in our collection is
                  carefully selected and crafted to meet our exacting standards of quality and design.
                </p>
                <p>
                  From our signature palazzo collection to our premium branded fabrics, we are committed
                  to delivering fashion that makes every woman feel confident, beautiful, and ready to
                  command any room she walks into.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden bg-brand-100">
                <img
                  src="/images/about-hero.png"
                  alt="Meglit Couture craftsmanship"
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-brand-950 text-white p-5 hidden md:block">
                <p className="font-heading text-3xl font-bold">5+</p>
                <p className="text-xs text-brand-300 tracking-wider uppercase">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-brand-50" id="about-values">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What Drives Us</h2>
            <div className="section-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Quality First",
                desc: "We source only the finest materials and work with skilled artisans to ensure every product meets our premium standards.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                title: "African Heritage",
                desc: "We celebrate African craftsmanship and incorporate traditional techniques into modern, wearable fashion.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                ),
              },
              {
                title: "Customer Love",
                desc: "Our customers are at the heart of everything we do. From personalized styling to doorstep delivery, we go the extra mile.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 text-center hover:shadow-md transition-shadow border border-brand-100" id={`value-${i}`}>
                <div className="w-12 h-12 mx-auto bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-brand-950 mb-3">{value.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-950 py-16" id="about-stats">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Happy Clients" },
              { value: "100+", label: "Unique Designs" },
              { value: "50+", label: "Fabric Varieties" },
              { value: "5+", label: "Years in Fashion" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-heading text-3xl md:text-4xl font-bold text-accent-400">{stat.value}</p>
                <p className="text-brand-300 text-xs mt-1 tracking-wider uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white text-center" id="about-cta">
        <div className="container-custom max-w-xl">
          <h2 className="font-heading text-3xl font-bold text-brand-950 mb-4">
            Ready to Experience Meglit?
          </h2>
          <p className="text-ink-500 text-sm mb-8">
            Explore our collection and discover your next favourite piece.
          </p>
          <Link href="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
