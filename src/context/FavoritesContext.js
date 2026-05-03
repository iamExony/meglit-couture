"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { customer } = useCustomerAuth();
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastCustomerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!customer) {
      setIds([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setIds(Array.isArray(data?.favorites) ? data.favorites.map(String) : []);
      }
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    if (lastCustomerRef.current === customer?.id) return;
    lastCustomerRef.current = customer?.id || null;
    refresh();
  }, [customer, refresh]);

  const isFavorite = useCallback((productId) => ids.includes(String(productId)), [ids]);

  const toggle = useCallback(
    async (productId) => {
      if (!customer) return { ok: false, requiresAuth: true };
      const id = String(productId);
      // Optimistic update.
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: id }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Roll back.
          await refresh();
          return { ok: false };
        }
        return { ok: true, favorited: !!data.favorited };
      } catch {
        await refresh();
        return { ok: false };
      }
    },
    [customer, refresh]
  );

  return (
    <FavoritesContext.Provider value={{ ids, loading, isFavorite, toggle, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
