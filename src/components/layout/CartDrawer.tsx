"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    cartCount,
    openAuthModal,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md bg-[#F5F3EF] border-l border-[#D8D5CF] flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#D8D5CF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-[#111111]" />
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                    Your Bag ({cartCount})
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-[#111111] hover:opacity-60 transition-opacity"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free shipping progress indicator */}
              <div className="px-6 py-3 bg-[#EAE8E2] border-b border-[#D8D5CF]/60 text-[11px] text-[#111111] flex items-center justify-between">
                {subtotal >= 250 ? (
                  <span className="font-medium">
                    You have unlocked complimentary global express delivery.
                  </span>
                ) : (
                  <span>
                    Add <strong className="font-semibold">{formatPrice(250 - subtotal)}</strong> more for free global express shipping.
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-[#D8D5CF]/60 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-7 h-7 text-[#6B6B6B]" />
                    </div>
                    <p className="text-sm uppercase tracking-wider text-[#111111] font-medium">
                      Your bag is empty
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1 max-w-xs">
                      Discover our architectural outerwear and minimalist collection.
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-6 py-2.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
                    >
                      Explore Collection
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="pt-6 first:pt-0 flex gap-4"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="relative w-20 h-26 bg-[#EAE8E2] overflow-hidden shrink-0"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-xs uppercase tracking-wider text-[#111111] font-medium hover:opacity-75 transition-opacity"
                            >
                              {item.product.name}
                            </Link>
                            <span className="text-xs font-medium text-[#111111]">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>

                          <div className="mt-1 text-[11px] text-[#6B6B6B] space-x-2">
                            <span>Color: {item.color}</span>
                            <span>•</span>
                            <span>Size: {item.size}</span>
                          </div>
                        </div>

                        {/* Quantity and Remove */}
                        <div className="flex items-center justify-between pt-3">
                          <div className="flex items-center border border-[#D8D5CF] bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#111111] hover:bg-black/5 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium text-[#111111]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#111111] hover:bg-black/5 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                            className="text-[#6B6B6B] hover:text-[#111111] transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-[#D8D5CF] bg-[#F5F3EF]">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-[#6B6B6B]">
                      <span>Subtotal</span>
                      <span className="text-[#111111] font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B6B6B]">
                      <span>Shipping</span>
                      <span>{subtotal >= 250 ? "Complimentary" : "Calculated at checkout"}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-[#111111] pt-2 border-t border-[#D8D5CF]/60">
                      <span>Total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        if (!isAuthenticated) {
                          openAuthModal("Authentication is required to proceed to checkout.");
                        } else {
                          router.push("/checkout");
                        }
                      }}
                      className="w-full py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-2.5 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-black/5 transition-colors flex items-center justify-center"
                    >
                      View Full Bag
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
