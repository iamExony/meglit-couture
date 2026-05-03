"use client";
import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";

const CartContext = createContext();

const initialState = {
  items: [],
  isOpen: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "LOAD_CART":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.payload.quantity || 1;
        return { ...state, items: newItems, isOpen: true };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
        isOpen: true,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const newItems = [...state.items];
      if (action.payload.quantity <= 0) {
        newItems.splice(action.payload.index, 1);
      } else {
        newItems[action.payload.index].quantity = action.payload.quantity;
      }
      return { ...state, items: newItems };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

function mergeCartItems(a, b) {
  const out = [];
  const keyOf = (it) => `${it.id}::${it.selectedSize || ""}::${it.selectedColor || ""}`;
  const map = new Map();
  for (const list of [a, b]) {
    for (const it of list || []) {
      const k = keyOf(it);
      if (map.has(k)) {
        const existing = map.get(k);
        existing.quantity = (existing.quantity || 0) + (it.quantity || 0);
      } else {
        map.set(k, { ...it, quantity: it.quantity || 1 });
        out.push(map.get(k));
      }
    }
  }
  return out;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { customer } = useCustomerAuth();
  const hydratedRef = useRef(false);
  const syncTimerRef = useRef(null);
  const lastCustomerIdRef = useRef(null);

  // Initial load from localStorage (guest cart).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("meglit-cart");
      if (saved) {
        dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
      }
    } catch {}
    hydratedRef.current = true;
  }, []);

  // Persist to localStorage on every change.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem("meglit-cart", JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  // On sign-in: merge guest cart with server cart, then keep server in sync.
  useEffect(() => {
    if (!customer) {
      lastCustomerIdRef.current = null;
      return;
    }
    if (lastCustomerIdRef.current === customer.id) return;
    lastCustomerIdRef.current = customer.id;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const serverItems = Array.isArray(data?.items) ? data.items : [];
        const localItems = state.items || [];
        const merged = mergeCartItems(serverItems, localItems);
        if (cancelled) return;
        dispatch({ type: "LOAD_CART", payload: merged });
        // Push merged cart back so server matches.
        fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items: merged }),
        }).catch(() => {});
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  // Debounced sync to server on subsequent local changes (only when authed).
  useEffect(() => {
    if (!hydratedRef.current || !customer) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: state.items }),
      }).catch(() => {});
    }, 500);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [state.items, customer]);

  const addItem = (product, selectedSize, selectedColor, quantity = 1) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { ...product, selectedSize, selectedColor, quantity },
    });
  };

  const removeItem = (index) => {
    dispatch({ type: "REMOVE_ITEM", payload: index });
  };

  const updateQuantity = (index, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { index, quantity } });
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        cartCount,
        cartTotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
