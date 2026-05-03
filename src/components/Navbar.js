"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { customer, signOut, loading } = useCustomerAuth();
  const accountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/shop?category=palazzo", label: "Palazzo" },
    { href: "/shop?category=fabric", label: "Fabrics" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-brand-950 text-white text-center py-2.5 text-[11px] sm:text-xs tracking-[0.15em] uppercase">
        Free delivery on orders over ₦50,000 &mdash; Code:{" "}
        <span className="text-accent-400 font-semibold">MEGLIT10</span>
      </div>

      <nav
        className={`sticky top-0 z-50 transition-all duration-200 border-b ${
          isScrolled
            ? "bg-white/98 backdrop-blur-sm border-brand-100 shadow-sm"
            : "bg-white border-transparent"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-brand-800"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center" id="site-logo">
              <div className="flex flex-col items-center leading-none">
                <span className="font-heading text-[22px] md:text-[26px] font-bold text-brand-950 tracking-[0.08em]">
                  MEGLIT
                </span>
                <span className="text-[9px] md:text-[10px] tracking-[0.35em] text-accent-600 uppercase font-medium -mt-0.5">
                  Couture
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-medium text-ink-600 hover:text-brand-950 transition-colors uppercase tracking-[0.15em]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <Link href="/shop" className="p-2 text-ink-500 hover:text-brand-950 transition-colors" id="nav-search">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Account */}
              <div className="relative" ref={accountRef}>
                {customer ? (
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-brand-50 transition-colors"
                    aria-label="Account"
                    id="nav-account"
                  >
                    {customer.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={customer.picture} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-semibold">
                        {(customer.firstName?.[0] || customer.email?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/signin"
                    className="hidden sm:inline text-[11px] font-medium text-ink-600 hover:text-brand-950 uppercase tracking-[0.15em] px-3 py-2"
                    id="nav-signin"
                  >
                    {loading ? "" : "Sign in"}
                  </Link>
                )}

                {customer && accountOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-brand-100 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-brand-100">
                      <div className="text-sm font-semibold text-brand-950 truncate">
                        {customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email}
                      </div>
                      <div className="text-xs text-ink-500 truncate">{customer.email}</div>
                    </div>
                    <Link href="/account" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50">
                      My account
                    </Link>
                    <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50">
                      My orders
                    </Link>
                    <Link href="/account/favorites" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50">
                      Favorites
                    </Link>
                    <button
                      onClick={() => { setAccountOpen(false); signOut(); }}
                      className="w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 border-t border-brand-100 mt-1"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-ink-500 hover:text-brand-950 transition-colors"
                aria-label="Cart"
                id="nav-cart"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent-600 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[420px] border-t border-brand-100" : "max-h-0"
          }`}
        >
          <div className="container-custom py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 px-4 text-[11px] font-medium text-ink-700 hover:text-brand-950 hover:bg-brand-50 transition-colors uppercase tracking-[0.15em]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
