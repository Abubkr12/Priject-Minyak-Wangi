"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Cart, CartItem } from "@/lib/types";

interface CartContextValue {
  cart: Cart;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQuantity: (sizeId: number, qty: number) => void;
  removeItem: (sizeId: number) => void;
  clearCart: () => void;
  setVoucher: (code: string | null) => void;
  totalItems: number;
  subtotal: number;
}

const STORAGE_KEY = "perfume-cart";

const emptyCart: Cart = { items: [], voucherCode: null };

const CartContext = createContext<CartContextValue>({
  cart: emptyCart,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  setVoucher: () => {},
  totalItems: 0,
  subtotal: 0,
});

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Cart;
        if (parsed && Array.isArray(parsed.items)) {
          setCart(parsed);
        }
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, mounted]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setCart((prev) => {
        const existing = prev.items.find((i) => i.sizeId === item.sizeId);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.sizeId === item.sizeId
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          };
        }
        return {
          ...prev,
          items: [...prev.items, { ...item, quantity: qty }],
        };
      });
    },
    []
  );

  const updateQuantity = useCallback((sizeId: number, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        return {
          ...prev,
          items: prev.items.filter((i) => i.sizeId !== sizeId),
        };
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.sizeId === sizeId ? { ...i, quantity: qty } : i
        ),
      };
    });
  }, []);

  const removeItem = useCallback((sizeId: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.sizeId !== sizeId),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart(emptyCart);
  }, []);

  const setVoucher = useCallback((code: string | null) => {
    setCart((prev) => ({ ...prev, voucherCode: code }));
  }, []);

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setVoucher,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
