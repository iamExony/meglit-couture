"use client";
import Link from "next/link";
import SubscribeForm from "./SubscribeForm";

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white" id="site-footer">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <span className="font-heading text-2xl font-bold text-white tracking-[0.08em]">MEGLIT</span>
              <span className="block text-[9px] tracking-[0.35em] text-accent-400 uppercase font-medium">
                Couture
              </span>
            </div>
            <p className="text-brand-300 text-sm leading-relaxed mb-6">
              Redefining elegance with our exclusive palazzo collections and
              premium branded fabrics. Where sophistication meets African
              craftsmanship.
            </p>
            <div className="flex gap-3">
              {["instagram", "facebook", "twitter", "tiktok"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 border border-brand-700 flex items-center justify-center text-brand-400 hover:border-accent-400 hover:text-accent-400 transition-colors"
                  aria-label={social}
                >
                  <SocialIcon name={social} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-accent-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/shop", label: "Shop All" },
                { href: "/shop?category=palazzo", label: "Palazzo Collection" },
                { href: "/shop?category=Fabrics", label: "Fabrics" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-brand-800">
                <Link href="/become-a-vendor" className="text-accent-400 hover:text-accent-300 transition-colors text-sm font-medium">
                  Sell on Meglit
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="text-brand-400 hover:text-white transition-colors text-sm">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-accent-400">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {[
                "Shipping & Delivery",
                "Returns & Exchange",
                "Size Guide",
                "FAQs",
                "Track Order",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-brand-300 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-accent-400">
              Stay Connected
            </h3>
            <p className="text-brand-300 text-sm mb-4">
              Subscribe for exclusive offers, new arrivals, and style
              inspiration.
            </p>
            <SubscribeForm variant="footer" source="footer" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-800">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-500 text-xs">
            © {new Date().getFullYear()} Meglit Couture. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-brand-500 text-xs">We accept:</span>
            <div className="flex items-center gap-2">
              {["Visa", "Mastercard", "Paystack"].map((p) => (
                <span
                  key={p}
                  className="text-brand-400 text-[10px] px-2.5 py-1 border border-brand-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }) {
  const icons = {
    instagram: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    facebook: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
