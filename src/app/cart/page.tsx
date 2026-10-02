"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, subtotal, cartCount, openAuthModal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "NOIR10" || promoCode.trim().toUpperCase() === "VIP") {
      setAppliedDiscount(0.1); // 10% off
      setPromoError("");
    } else {
      setPromoError("Invalid privilege code. Try 'NOIR10'.");
    }
  };

  const discountAmount = subtotal * appliedDiscount;
  const shippingFee = subtotal >= 250 ? 0 : 25;
  const estimatedTotal = subtotal - discountAmount + shippingFee;

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-8 border-b border-[#D8D5CF]">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
            BAG REVIEW
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal uppercase tracking-tight text-[#111111]">
              Shopping Bag
            </h1>
            <span className="text-xs uppercase tracking-widest text-[#6B6B6B]">
              {cartCount} {cartCount === 1 ? "Item" : "Items"} Selected
            </span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-[#6B6B6B]" />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111] uppercase">
              Your Bag is Empty
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-2 max-w-sm">
              Explore our architectural tailoring, minimal outerwear, and kinetic staples.
            </p>
            <Link
              href="/shop"
              className="mt-8 px-8 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center gap-2"
            >
              <span>Explore Atelier Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 items-start">
            {/* Left: Items List */}
            <div className="lg:col-span-8 divide-y divide-[#D8D5CF]">
              {cart.map((item) => (
                <div key={item.id} className="py-6 first:pt-0 flex gap-6 sm:gap-8">
                  {/* Image */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative w-24 sm:w-32 aspect-[3/4] bg-[#EAE8E2] overflow-hidden shrink-0"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-editorial text-lg sm:text-xl uppercase text-[#111111] hover:opacity-75 transition-opacity"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-sm font-medium text-[#111111]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-[#6B6B6B]">
                        <span>Color: {item.color}</span>
                        <span>Size: {item.size}</span>
                        <span>Unit: {formatPrice(item.product.price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#D8D5CF] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-black/5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center text-xs font-medium text-[#111111]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-black/5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 bg-[#EAE8E2]/60 border border-[#D8D5CF] p-8 space-y-6">
              <h2 className="font-editorial text-2xl uppercase tracking-tight text-[#111111]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-[#6B6B6B] border-b border-[#D8D5CF] pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium">{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Privilege Discount (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>{shippingFee === 0 ? "Complimentary" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Import Duties & Taxes</span>
                  <span>Included</span>
                </div>
              </div>

              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Privilege Code (Try: NOIR10)"
                    className="flex-1 bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111] placeholder-[#6B6B6B] focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-red-600">{promoError}</p>
                )}
                {appliedDiscount > 0 && (
                  <p className="text-[11px] text-emerald-600">VIP Code NOIR10 Applied (-10%)</p>
                )}
              </form>

              {/* Total */}
              <div className="pt-2 flex justify-between items-baseline text-base font-semibold text-[#111111] border-t border-[#D8D5CF]">
                <span>Estimated Total</span>
                <span className="text-xl font-light">{formatPrice(estimatedTotal)}</span>
              </div>

              {/* Checkout Button */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal("Authentication is required to proceed to checkout.");
                    } else {
                      router.push("/checkout");
                    }
                  }}
                  className="w-full py-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  href="/shop"
                  className="w-full py-2.5 text-center text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#111111] transition-colors block"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="pt-4 border-t border-[#D8D5CF] flex items-center justify-center gap-4 text-[10px] text-[#6B6B6B] uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Global Express</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
