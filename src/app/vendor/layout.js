"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/vendor/products", label: "My Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" },
  { href: "/vendor/orders", label: "Orders", icon: "M3 7h18M3 12h18M3 17h18", badge: true },
  { href: "/vendor/payouts", label: "Payouts", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { href: "/vendor/settings", label: "Payout Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function VendorLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [open, setOpen] = useState(false);
  const [newOrders, setNewOrders] = useState(0);
  const isLogin = pathname === "/vendor/login" || pathname === "/vendor/forgot-password" || pathname.startsWith("/vendor/reset-password");

  useEffect(() => {
    if (isLogin) return;
    let alive = true;

    fetch("/api/vendor/me").then((r) => r.json()).then((d) => {
      if (!alive) return;
      if (d.vendor) setVendor(d.vendor);
      else router.replace("/vendor/login");
    });

    function loadNotifications() {
      fetch("/api/vendor/notifications")
        .then((r) => r.json())
        .then((d) => { if (alive) setNewOrders(d.newOrders || 0); })
        .catch(() => {});
    }

    loadNotifications();
    const t = setInterval(loadNotifications, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [isLogin, pathname, router]);

  if (isLogin) return <div className="min-h-screen bg-brand-50">{children}</div>;

  async function logout() {
    await fetch("/api/vendor/login", { method: "DELETE" });
    router.replace("/vendor/login");
  }

  return (
    <div className="min-h-screen flex bg-brand-50 text-ink-950">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-brand-950 text-white transform transition-transform duration-200 flex flex-col ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-heading text-xl font-bold text-white tracking-[0.08em]">MEGLIT</span>
            <span className="text-[10px] tracking-[0.3em] text-accent-400 uppercase font-medium mt-0.5">Vendor Portal</span>
          </Link>
        </div>

        {vendor && (
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs font-semibold text-white truncate">{vendor.storeName}</p>
            <p className="text-[11px] text-white/50 truncate">{vendor.email}</p>
          </div>
        )}

        <nav className="p-3 space-y-1 flex-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/vendor/dashboard" && pathname.startsWith(item.href));
            const badgeCount = item.badge ? newOrders : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full font-bold flex items-center justify-center">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-white/60 hover:text-white transition-colors rounded hover:bg-white/5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-brand-100 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="text-ink-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-heading font-bold text-brand-950 text-sm">Vendor Portal</span>
          </div>
          {newOrders > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {newOrders} new order{newOrders !== 1 ? "s" : ""}
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
