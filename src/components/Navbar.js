"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const NAV_MENUS = [
  { label: "New In", href: "/shop?filter=new" },
  {
    label: "Hair",
    href: "/shop?category=Wigs",
    columns: [
      {
        title: "Wigs",
        links: [
          { label: "All Wigs", href: "/shop?category=Wigs" },
          { label: "Frontal Wigs", href: "/shop?category=Wigs&sub=Frontal+Wigs" },
          { label: "Closure Wigs", href: "/shop?category=Wigs&sub=Closure+Wigs" },
          { label: "Glueless Wigs", href: "/shop?category=Wigs&sub=Glueless+Wigs" },
          { label: "Bob Wigs", href: "/shop?category=Wigs&sub=Bob+Wigs" },
        ],
      },
      {
        title: "Bundles & Extensions",
        links: [
          { label: "All Bundles", href: "/shop?category=Bundles+%26+Deals" },
          { label: "3-Bundle Deals", href: "/shop?category=Bundles+%26+Deals&sub=3-Bundle+Deals" },
          { label: "Closures & Frontals", href: "/shop?category=Closures+%26+Frontals" },
          { label: "Clip-ins & Ponytails", href: "/shop?category=Clip-ins+%26+Ponytails" },
        ],
      },
      {
        title: "Featured",
        links: [
          { label: "HD Lace Collection", href: "/shop?category=Wigs&sub=Frontal+Wigs" },
          { label: "Glueless Wigs", href: "/shop?category=Wigs&sub=Glueless+Wigs" },
          { label: "Raw Vietnamese Hair", href: "/shop?category=Bundles+%26+Deals" },
          { label: "View All Hair →", href: "/shop?category=Wigs" },
        ],
      },
    ],
  },
  {
    label: "Bags",
    href: "/shop?category=Handbags",
    columns: [
      {
        title: "Handbags",
        links: [
          { label: "All Handbags", href: "/shop?category=Handbags" },
          { label: "Tote Bags", href: "/shop?category=Handbags&sub=Tote+Bags" },
          { label: "Shoulder Bags", href: "/shop?category=Handbags&sub=Shoulder+Bags" },
          { label: "Crossbody Bags", href: "/shop?category=Handbags&sub=Crossbody+Bags" },
          { label: "Clutch Bags", href: "/shop?category=Handbags&sub=Clutch+Bags" },
          { label: "Mini Bags", href: "/shop?category=Handbags&sub=Mini+Bags" },
        ],
      },
      {
        title: "More Bags",
        links: [
          { label: "Backpacks", href: "/shop?category=Backpacks" },
          { label: "Wallets & Purses", href: "/shop?category=Wallets+%26+Purses" },
          { label: "Travel & Duffel Bags", href: "/shop?category=Travel+Bags" },
          { label: "View All Bags →", href: "/shop?category=Handbags" },
        ],
      },
    ],
  },
  {
    label: "Shoes",
    href: "/shop?category=Heels",
    columns: [
      {
        title: "Heels",
        links: [
          { label: "All Heels", href: "/shop?category=Heels" },
          { label: "Stilettos", href: "/shop?category=Heels&sub=Stilettos" },
          { label: "Block Heels", href: "/shop?category=Heels&sub=Block+Heels" },
          { label: "Wedge Heels", href: "/shop?category=Heels&sub=Wedge+Heels" },
          { label: "Platform Heels", href: "/shop?category=Heels&sub=Platform+Heels" },
        ],
      },
      {
        title: "Flats & Casual",
        links: [
          { label: "Flats & Loafers", href: "/shop?category=Flats+%26+Loafers" },
          { label: "Sandals", href: "/shop?category=Sandals" },
          { label: "Sneakers & Casual", href: "/shop?category=Sneakers+%26+Casual" },
        ],
      },
      {
        title: "Boots",
        links: [
          { label: "All Boots", href: "/shop?category=Boots" },
          { label: "Ankle Boots", href: "/shop?category=Boots&sub=Ankle+Boots" },
          { label: "Knee-High Boots", href: "/shop?category=Boots&sub=Knee-High+Boots" },
          { label: "View All Shoes →", href: "/shop?category=Heels" },
        ],
      },
    ],
  },
  {
    label: "Jewelry",
    href: "/shop?category=Earrings",
    columns: [
      {
        title: "Earrings",
        links: [
          { label: "All Earrings", href: "/shop?category=Earrings" },
          { label: "Hoop Earrings", href: "/shop?category=Earrings&sub=Hoop+Earrings" },
          { label: "Stud Earrings", href: "/shop?category=Earrings&sub=Stud+Earrings" },
          { label: "Drop Earrings", href: "/shop?category=Earrings&sub=Drop+Earrings" },
          { label: "Ear Cuffs", href: "/shop?category=Earrings&sub=Ear+Cuffs" },
        ],
      },
      {
        title: "Chains & Bangles",
        links: [
          { label: "Necklaces", href: "/shop?category=Necklaces" },
          { label: "Layered Chains", href: "/shop?category=Necklaces&sub=Layered+Chains" },
          { label: "Bangles & Bracelets", href: "/shop?category=Bangles+%26+Bracelets" },
          { label: "Rings", href: "/shop?category=Rings" },
        ],
      },
      {
        title: "Collections",
        links: [
          { label: "Jewelry Sets", href: "/shop?category=Sets+%26+Bundles" },
          { label: "Bridal Jewelry", href: "/shop?category=Sets+%26+Bundles&sub=Full+Jewelry+Sets" },
          { label: "Gift Sets", href: "/shop?category=Sets+%26+Bundles&sub=Bracelet+Sets" },
          { label: "View All Jewelry →", href: "/shop?category=Earrings" },
        ],
      },
    ],
  },
  {
    label: "Perfume",
    href: "/shop?category=Eau+de+Parfum",
    columns: [
      {
        title: "Fragrance Type",
        links: [
          { label: "Eau de Parfum", href: "/shop?category=Eau+de+Parfum" },
          { label: "Eau de Toilette", href: "/shop?category=Eau+de+Toilette" },
          { label: "Body Mist & Spray", href: "/shop?category=Body+Mist+%26+Spray" },
          { label: "Perfume Oil", href: "/shop?category=Perfume+Oil" },
        ],
      },
      {
        title: "By Gender",
        links: [
          { label: "For Her", href: "/shop?category=Eau+de+Parfum&sub=Women%27s+EDP" },
          { label: "For Him", href: "/shop?category=Eau+de+Parfum&sub=Men%27s+EDP" },
          { label: "Unisex", href: "/shop?category=Eau+de+Parfum&sub=Unisex+EDP" },
          { label: "Arabian Oud", href: "/shop?category=Perfume+Oil" },
        ],
      },
      {
        title: "Collections",
        links: [
          { label: "Fragrance Sets", href: "/shop?category=Fragrance+Sets" },
          { label: "Travel Minis", href: "/shop?category=Fragrance+Sets&sub=Mini+Travel+Sets" },
          { label: "Gift Sets", href: "/shop?category=Fragrance+Sets&sub=Gift+Sets" },
          { label: "View All Perfume →", href: "/shop?category=Eau+de+Parfum" },
        ],
      },
    ],
  },
  {
    label: "Palazzo",
    href: "/shop?category=Palazzo",
    columns: [
      {
        title: "Palazzo Sets",
        links: [
          { label: "All Palazzo", href: "/shop?category=Palazzo" },
          { label: "Evening Palazzo", href: "/shop?category=Palazzo&sub=Evening+Palazzo" },
          { label: "Casual Palazzo", href: "/shop?category=Palazzo&sub=Casual+Palazzo" },
          { label: "Silk Palazzo", href: "/shop?category=Palazzo&sub=Silk+Palazzo" },
        ],
      },
      {
        title: "Palazzo Trousers",
        links: [
          { label: "Pleated Palazzo", href: "/shop?category=Palazzo&sub=Pleated+Palazzo" },
          { label: "Sequin Palazzo", href: "/shop?category=Palazzo&sub=Sequin+Palazzo" },
          { label: "Royal Collection", href: "/shop?category=Palazzo&sub=Royal+Palazzo" },
          { label: "View All Palazzo →", href: "/shop?category=Palazzo" },
        ],
      },
    ],
  },
  { label: "Fabrics", href: "/shop?category=Fabrics" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { customer, signOut, loading } = useCustomerAuth();
  const accountRef = useRef(null);
  const menuTimeoutRef = useRef(null);
  const announcement = useQuery(api.announcements.getActive, {});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  const openMenu = (label) => {
    clearTimeout(menuTimeoutRef.current);
    setActiveMenu(label);
  };
  const closeMenu = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 120);
  };

  return (
    <>
      {/* Announcement bar — dynamic from admin */}
      {announcement && (
        <div className="bg-brand-950 text-white text-center py-2.5 text-[11px] sm:text-xs tracking-[0.15em] uppercase">
          {announcement.message}
          {announcement.code && (
            <> &mdash; Code:{" "}
              <span className="text-accent-400 font-semibold">{announcement.code}</span>
            </>
          )}
        </div>
      )}

      <nav
        className={`sticky top-0 z-50 transition-all duration-200 border-b ${
          isScrolled
            ? "bg-white/98 backdrop-blur-sm border-brand-100 shadow-sm"
            : "bg-white border-transparent"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Hamburger */}
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
            <Link href="/" className="flex items-center flex-shrink-0" id="site-logo">
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
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {NAV_MENUS.map((menu) => (
                <div
                  key={menu.label}
                  className="relative"
                  onMouseEnter={() => menu.columns && openMenu(menu.label)}
                  onMouseLeave={() => menu.columns && closeMenu()}
                >
                  <Link
                    href={menu.href}
                    className={`flex items-center gap-0.5 text-[11px] font-medium uppercase tracking-[0.14em] px-2.5 py-2 rounded transition-colors whitespace-nowrap ${
                      activeMenu === menu.label
                        ? "text-brand-950"
                        : "text-ink-600 hover:text-brand-950"
                    }`}
                  >
                    {menu.label}
                    {menu.columns && (
                      <svg
                        className={`w-2.5 h-2.5 ml-0.5 transition-transform duration-150 ${
                          activeMenu === menu.label ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Mega dropdown */}
                  {menu.columns && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[200] transition-all duration-150 ${
                        activeMenu === menu.label
                          ? "opacity-100 pointer-events-auto translate-y-0"
                          : "opacity-0 pointer-events-none -translate-y-1"
                      }`}
                      onMouseEnter={() => openMenu(menu.label)}
                      onMouseLeave={closeMenu}
                    >
                      <div className="bg-white border border-brand-100 shadow-2xl rounded-xl p-6 flex gap-8 min-w-max">
                        {menu.columns.map((col) => (
                          <div key={col.title} className="min-w-[140px]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 mb-3 pb-2 border-b border-brand-100">
                              {col.title}
                            </p>
                            <ul className="space-y-2">
                              {col.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={() => setActiveMenu(null)}
                                    className="text-[12px] text-ink-700 hover:text-accent-600 transition-colors leading-snug"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Link
                href="/shop"
                className="p-2 text-ink-500 hover:text-brand-950 transition-colors"
                aria-label="Search"
                id="nav-search"
              >
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
                      <img
                        src={customer.picture}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
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
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-brand-100 rounded-lg shadow-lg py-2 z-[200]">
                    <div className="px-4 py-3 border-b border-brand-100">
                      <div className="text-sm font-semibold text-brand-950 truncate">
                        {customer.name ||
                          `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                          customer.email}
                      </div>
                      <div className="text-xs text-ink-500 truncate">{customer.email}</div>
                    </div>
                    <Link href="/account" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50">My account</Link>
                    <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50">My orders</Link>
                    <Link href="/account/favorites" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50">Favorites</Link>
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

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[700px] border-t border-brand-100" : "max-h-0"
          }`}
        >
          <div className="bg-white divide-y divide-brand-50">
            {NAV_MENUS.map((menu) =>
              menu.columns ? (
                <div key={menu.label}>
                  <button
                    onClick={() =>
                      setMobileExpanded(mobileExpanded === menu.label ? null : menu.label)
                    }
                    className="flex items-center justify-between w-full px-5 py-3.5 text-[11px] font-semibold text-ink-700 uppercase tracking-[0.15em]"
                  >
                    {menu.label}
                    <svg
                      className={`w-3.5 h-3.5 text-ink-400 transition-transform ${
                        mobileExpanded === menu.label ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      mobileExpanded === menu.label ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <div className="bg-brand-50/60 px-5 pb-3 pt-1">
                      {menu.columns.map((col) => (
                        <div key={col.title} className="mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 mt-2 mb-1.5">
                            {col.title}
                          </p>
                          {col.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setMobileExpanded(null);
                              }}
                              className="block py-1.5 text-[12px] text-ink-700 hover:text-accent-600"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={menu.label}
                  href={menu.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-5 py-3.5 text-[11px] font-medium text-ink-700 uppercase tracking-[0.15em] hover:bg-brand-50"
                >
                  {menu.label}
                </Link>
              )
            )}
            <div className="bg-brand-50/40 px-5 py-3 flex flex-col gap-0.5">
              <Link
                href="/become-a-vendor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-[11px] font-semibold text-accent-600 uppercase tracking-[0.15em]"
              >
                Sell on Meglit
              </Link>
              <Link
                href="/vendor/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-[11px] font-medium text-ink-500 uppercase tracking-[0.15em]"
              >
                Vendor Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
