"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Slim top progress bar + brand spinner shown during route transitions.
 *
 * - Captures clicks on internal anchors (and form submits) to start the bar
 *   immediately, so the user gets feedback before the new segment streams in.
 * - When the pathname/search params change we treat navigation as complete.
 * - Falls back to a 12s timeout to clear if something goes wrong.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const safetyRef = useRef(null);

  // Stop animation when route actually changes.
  useEffect(() => {
    setProgress(100);
    const t = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 250);
    if (timerRef.current) clearInterval(timerRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    return () => clearTimeout(t);
    // Re-run on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // Click capture for internal links + form submissions.
  useEffect(() => {
    const start = () => {
      setActive(true);
      setProgress(8);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p; // hold near end until real navigation completes
          // Ease-out increment: bigger jumps at start, smaller near top.
          const inc = Math.max(0.5, (90 - p) * 0.08);
          return Math.min(90, p + inc);
        });
      }, 120);
      if (safetyRef.current) clearTimeout(safetyRef.current);
      safetyRef.current = setTimeout(() => {
        setActive(false);
        setProgress(0);
        if (timerRef.current) clearInterval(timerRef.current);
      }, 12000);
    };

    const onClick = (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // left-click only
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;
      // External links?
      if (/^https?:\/\//i.test(href)) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }
      // Same path + hash navigation shouldn't trigger.
      try {
        const url = new URL(a.href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
      } catch {
        /* ignore */
      }
      start();
    };

    const onSubmit = (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      // Only show progress for non-AJAX form submits that change the URL.
      const method = (form.method || "get").toLowerCase();
      const action = form.getAttribute("action");
      if (method === "get" && (!action || action === "" || action === "#")) return;
      // Skip our async fetch-based forms (they call preventDefault).
      if (e.defaultPrevented) return;
      start();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  return (
    <>
      {/* Top progress bar */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none"
        style={{ height: 2 }}
      >
        <div
          className="h-full bg-gradient-to-r from-accent-500 via-accent-400 to-accent-600 shadow-[0_0_10px_rgba(228,166,78,0.7)]"
          style={{
            width: `${progress}%`,
            opacity: active ? 1 : 0,
            transition: "width 200ms ease-out, opacity 250ms ease",
          }}
        />
      </div>

      {/* Centered branded spinner — appears once nav is taking longer than a moment. */}
      {active && progress > 25 ? (
        <div
          aria-hidden
          className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none animate-fade-in"
        >
          <div
            className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white to-brand-50/90 shadow-[0_20px_60px_-20px_rgba(44,35,25,0.35)] ring-1 ring-brand-100"
          >
            {/* Outer ring — accent gold, clockwise */}
            <span
              className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-accent-500 border-r-accent-500 animate-spin"
              style={{ animationDuration: "1.1s" }}
            />
            {/* Inner ring — deep brand, counter-clockwise */}
            <span
              className="absolute inset-5 rounded-full border-[2.5px] border-transparent border-b-brand-950 border-l-brand-950"
              style={{ animation: "spin 1.6s linear infinite reverse" }}
            />
            {/* Logo */}
            <img
              src="/meglit-logo.svg"
              alt="Meglit"
              width={48}
              height={48}
              className="relative object-contain select-none"
              style={{ filter: "brightness(0) saturate(0)" }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
