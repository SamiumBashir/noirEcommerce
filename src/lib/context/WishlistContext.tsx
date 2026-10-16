"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, PRODUCTS } from "@/lib/data/products";
import { mergeWithCustomProducts } from "@/lib/utils/productStorage";

interface WishlistContextType {
  wishlistIds: string[];
  wishlistItems: Product[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; actionText?: string; actionHref?: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("noir_wishlist");
    if (stored) {
      try {
        setWishlistIds(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse wishlist storage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("noir_wishlist", JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isMounted]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const isAlreadySaved = prev.includes(productId);
      if (isAlreadySaved) {
        setToast({ message: "Removed from Private Archive" });
        return prev.filter((id) => id !== productId);
      } else {
        setToast({
          message: "Saved to Private Archive",
          actionText: "View Archive",
          actionHref: "/account",
        });
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const [catalog, setCatalog] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      return mergeWithCustomProducts(PRODUCTS);
    }
    return PRODUCTS;
  });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCatalog(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const wishlistItems = catalog.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}

      {/* Floating Micro-interaction Toast for Wishlist */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3.5 bg-[#111111] text-[#F5F3EF] px-5 py-3 shadow-2xl border border-[#333333]"
          >
            <Heart className="w-4 h-4 fill-white text-white shrink-0" />
            <span className="text-xs uppercase tracking-wider font-medium">{toast.message}</span>
            {toast.actionText && toast.actionHref && (
              <Link
                href={toast.actionHref}
                onClick={() => setToast(null)}
                className="text-[11px] uppercase tracking-widest text-[#D8D5CF] underline hover:text-white transition-colors ml-1 font-mono"
              >
                {toast.actionText}
              </Link>
            )}
            <button
              onClick={() => setToast(null)}
              className="text-[#888888] hover:text-white transition-colors p-1 ml-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
