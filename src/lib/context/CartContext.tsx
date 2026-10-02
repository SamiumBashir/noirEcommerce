"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/data/products";
import { useAuth } from "@/lib/context/AuthContext";
import { AuthRequiredModal } from "@/components/ui/AuthRequiredModal";

export interface CartItem {
  id: string; // unique item id based on product.id + size + color
  productId: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
}

interface PendingCartItem {
  product: Product;
  color: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity?: number) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  lastAddedItem: CartItem | null;
  // Auth gate modal methods
  isAuthModalOpen: boolean;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Auth gate modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    "Please sign in or create an account to curate your shopping bag and acquire garments."
  );
  const [pendingItem, setPendingItem] = useState<PendingCartItem | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("noir_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("noir_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const openAuthModal = (message?: string) => {
    if (message) {
      setAuthModalMessage(message);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingItem(null);
  };

  // Helper to commit item to cart
  const commitAddToCart = (product: Product, color: string, size: string, quantity = 1) => {
    const itemId = `${product.id}-${color}-${size}`;
    let addedItem: CartItem;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        addedItem = { ...existing, quantity: existing.quantity + quantity };
        return prev.map((item) => (item.id === itemId ? addedItem : item));
      } else {
        addedItem = {
          id: itemId,
          productId: product.id,
          product,
          color,
          size,
          quantity,
        };
        return [...prev, addedItem];
      }
    });

    setLastAddedItem({
      id: itemId,
      productId: product.id,
      product,
      color,
      size,
      quantity,
    });
    setIsCartOpen(true);
  };

  const addToCart = (product: Product, color: string, size: string, quantity = 1): boolean => {
    // If user is not logged in / signed up, block adding to cart and open Auth Modal
    if (!isAuthenticated) {
      setPendingItem({ product, color, size, quantity });
      setAuthModalMessage(
        "Client Authentication Required: Please sign in or create an account to curate your shopping bag and acquire garments."
      );
      setIsAuthModalOpen(true);
      return false;
    }

    commitAddToCart(product, color, size, quantity);
    return true;
  };

  const handleAuthSuccess = () => {
    if (pendingItem) {
      commitAddToCart(
        pendingItem.product,
        pendingItem.color,
        pendingItem.size,
        pendingItem.quantity
      );
      setPendingItem(null);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        lastAddedItem,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        message={authModalMessage}
        onSuccess={handleAuthSuccess}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
