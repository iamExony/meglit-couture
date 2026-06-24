import Link from "next/link";
import Reveal from "./Reveal";

export default function PromoBanner() {
  return (
    <section className="section-padding bg-white" id="promo-section">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Promo 1 */}
          <Reveal className="relative overflow-hidden bg-brand-950 aspect-[16/9] lg:aspect-auto lg:min-h-[380px] group">
            <img
              src="/images/promo-sale.png"
              alt="Palazzo Collection Sale"
              className="w-full h-full object-cover opacity-40 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-50"
            />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
              <span className="text-accent-400 text-[11px] tracking-[0.25em] uppercase font-medium mb-3">
                Limited Time
              </span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Palazzo Sale<br />Up to 30% Off
              </h3>
              <p className="text-brand-300 text-sm mb-5 max-w-xs">
                Our best-selling palazzo collection, now at exceptional prices.
              </p>
              <Link href="/shop?category=palazzo" className="btn-accent self-start">
                Shop Now
              </Link>
            </div>
          </Reveal>

          {/* Promo 2 */}
          <Reveal delay={120} className="relative overflow-hidden bg-brand-950 aspect-[16/9] lg:aspect-auto lg:min-h-[380px] group">
            <img
              src="/images/promo-new.png"
              alt="Premium Fabrics - New Stock"
              className="w-full h-full object-cover opacity-40 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-50"
            />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
              <span className="text-accent-400 text-[11px] tracking-[0.25em] uppercase font-medium mb-3">
                New Stock
              </span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Premium Fabrics<br />Just Arrived
              </h3>
              <p className="text-brand-300 text-sm mb-5 max-w-xs">
                Explore our latest collection of premium branded fabrics.
              </p>
              <Link href="/shop?category=Fabrics" className="btn-accent self-start">
                Explore
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
