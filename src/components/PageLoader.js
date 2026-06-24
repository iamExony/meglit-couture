/**
 * Branded full-screen page loader.
 * - Centered card with a soft gray-white background and rounded corners.
 * - Two concentric rings rotating in opposite directions in alternating
 *   brand colors (deep brand + accent gold).
 * - Letter "M" anchored at the centre.
 *
 * Reused by every `loading.js` in the App Router so it appears
 * automatically on every route transition (storefront, admin, staff, etc.).
 */
import Image from "next/image";

export default function PageLoader({ label = "Loading" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-32 h-32 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white to-brand-50/90 shadow-[0_24px_60px_-22px_rgba(44,35,25,0.35)] ring-1 ring-brand-100">
          {/* Outer ring — accent gold, clockwise */}
          <span
            aria-hidden
            className="absolute inset-3 rounded-full border-[3px] border-transparent border-t-accent-500 border-r-accent-500 animate-spin"
            style={{ animationDuration: "1.2s" }}
          />
          {/* Inner ring — deep brand, counter-clockwise */}
          <span
            aria-hidden
            className="absolute inset-7 rounded-full border-[2.5px] border-transparent border-b-brand-950 border-l-brand-950"
            style={{ animation: "spin 1.8s linear infinite reverse" }}
          />
          {/* Logo */}
          <Image
            src="/meglit-logo.svg"
            alt="Meglit"
            width={52}
            height={52}
            className="relative object-contain select-none"
            style={{ filter: "brightness(0) saturate(0)" }}
            aria-hidden
          />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-brand-700 animate-soft-pulse">
          Meglit Couture
        </span>
      </div>
    </div>
  );
}
