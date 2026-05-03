"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

const Ctx = createContext(null);

const GIS_SRC = "https://accounts.google.com/gsi/client";

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gisReady, setGisReady] = useState(false);
  const initialised = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      setCustomer(data?.customer || null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Initialise Google Identity Services once the script is loaded.
  useEffect(() => {
    if (!gisReady || initialised.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || typeof window === "undefined" || !window.google?.accounts?.id) return;
    initialised.current = true;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (!response?.credential) return;
        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ credential: response.credential }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("[auth] google sign-in failed", err);
            return;
          }
          const data = await res.json();
          if (data?.customer) {
            setCustomer(data.customer);
            // Notify any listeners (e.g. checkout page waiting for sign-in)
            window.dispatchEvent(new CustomEvent("meglit:signin", { detail: data.customer }));
          }
        } catch (err) {
          console.error("[auth] sign-in request failed", err);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [gisReady]);

  const signIn = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      console.warn("[auth] Google Identity Services not ready yet");
      return;
    }
    window.google.accounts.id.prompt();
  }, []);

  const renderButton = useCallback((el, options = {}) => {
    if (!el || typeof window === "undefined" || !window.google?.accounts?.id) return;
    window.google.accounts.id.renderButton(el, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 320,
      ...options,
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({ customer, loading, signIn, signOut, refresh, renderButton, gisReady }),
    [customer, loading, signIn, signOut, refresh, renderButton, gisReady]
  );

  return (
    <Ctx.Provider value={value}>
      <Script src={GIS_SRC} strategy="afterInteractive" onReady={() => setGisReady(true)} onLoad={() => setGisReady(true)} />
      {children}
    </Ctx.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  return ctx;
}
