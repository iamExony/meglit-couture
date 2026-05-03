"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/admin/products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" },
  { href: "/admin/categories", label: "Categories", icon: "M4 6h16M4 12h16M4 18h16" },
  { href: "/admin/orders", label: "Orders", icon: "M3 7h18M3 12h18M3 17h18" },
  { href: "/admin/customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" },
  { href: "/admin/sales", label: "Sales", icon: "M3 3v18h18M7 14l4-4 4 4 5-5" },
  { href: "/admin/purchases", label: "Purchases", icon: "M6 6h15l-1.5 9h-13zM6 6L5 3H2m4 17a1 1 0 100 2 1 1 0 000-2zm12 0a1 1 0 100 2 1 1 0 000-2z" },
  { href: "/admin/analytics", label: "Analytics", icon: "M4 19V5m6 14V9m6 10v-6m6 6V3" },
  { href: "/admin/messages", label: "Messages", icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/admin/staff", label: "Staff", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", adminOnly: true },
  { href: "/admin/activity", label: "Activity", icon: "M3 12h4l3 8 4-16 3 8h4", adminOnly: true },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);

  // Login page renders without the chrome
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    let alive = true;
    async function load() {
      const res = await fetch("/api/admin/me");
      if (!alive) return;
      if (res.ok) {
        const data = await res.json();
        setMe(data.user);
        setUnread(data.unread || 0);
      } else {
        setMe(null);
        if (res.status === 401) router.replace("/admin/login");
      }
    }
    load();
    const t = setInterval(load, 20000);
    return () => { alive = false; clearInterval(t); };
  }, [isLogin, pathname, router]);

  if (isLogin) {
    return <div className="min-h-screen bg-brand-50">{children}</div>;
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  const visibleNav = NAV.filter((n) => !n.adminOnly || me?.role === "admin");

  return (
    <div className="min-h-screen flex bg-brand-50 text-ink-950">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-brand-950 text-white transform transition-transform duration-200 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="font-heading text-2xl font-bold text-white tracking-[0.08em]">MEGLIT</span>
            <span className="text-[10px] tracking-[0.35em] text-accent-400 uppercase font-medium mt-0.5">
              {me?.role === "admin" ? "Admin" : me?.role === "staff" ? "Staff" : "Dashboard"}
            </span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const showBadge = item.href === "/admin/messages" && unread > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-accent-600 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-1">
          {me && (
            <div className="text-xs text-white/80 mb-2">
              <div className="font-medium">{me.name || me.username}</div>
              <div className="text-white/50 capitalize">{me.role}</div>
            </div>
          )}
          <Link href="/" className="block text-xs text-white/60 hover:text-white">← View site</Link>
          <button onClick={logout} className="w-full text-left text-xs text-white/60 hover:text-white">Sign out</button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-brand-100 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 md:px-8 h-14">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-heading text-lg font-semibold text-brand-950 capitalize">
              {pathname === "/admin" ? "Dashboard" : pathname.split("/").pop()?.replace(/-/g, " ")}
            </h1>
            <div className="text-xs text-ink-500 hidden md:block">Meglit Couture · {me?.role === "admin" ? "Admin" : "Staff"}</div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
