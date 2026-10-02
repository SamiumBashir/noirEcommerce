"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Check, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCTS } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";

gsap.registerPlugin(ScrollTrigger);

export function InteractiveShowcase() {
  const router = useRouter();
  const product = PRODUCTS.find((p) => p.id === "noir-motion-jacket") || PRODUCTS[0];
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isAdded, setIsAdded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const imgWrapper = imageWrapperRef.current;
    if (!container || !imgWrapper) return;

    const ctx = gsap.context(() => {
      // Subtle scale and parallax as user scrolls through sticky section
      gsap.fromTo(
        imgWrapper,
        { scale: 0.98 },
        {
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  const handleAddToBag = () => {
    const success = addToCart(product, selectedColor.name, selectedSize, 1);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, selectedColor.name, selectedSize, 1);
    if (success) {
      router.push("/checkout");
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full py-28 md:py-36 bg-[#F5F3EF] px-6 sm:px-12 md:px-16 border-b border-[#D8D5CF]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
            IN FOCUS // ICONIC ARCHITECTURE
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-normal uppercase tracking-tight text-[#111111]">
            Interactive Showcase
          </h2>
        </div>

        {/* 2-Column Sticky Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Large Product Image with Dynamic Swatch Switching */}
          <div className="lg:col-span-7 sticky top-28">
            <div
              ref={imageWrapperRef}
              className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#EAE8E2] border border-[#D8D5CF] shadow-lg"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColor.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={selectedColor.image}
                    alt={`${product.name} in ${selectedColor.name}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Color Label Pill */}
              <div className="absolute bottom-6 left-6 z-10 bg-[#111111]/85 backdrop-blur-md text-[#F5F3EF] px-3.5 py-1.5 text-[11px] uppercase tracking-widest font-mono">
                COLORWAY: {selectedColor.name}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Product Information */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            {/* Title & Price */}
            <div className="border-b border-[#D8D5CF] pb-8">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#6B6B6B] block mb-2">
                MODEL NO. 09 // MENSWEAR
              </span>
              <h3 className="font-editorial text-4xl sm:text-5xl font-normal text-[#111111] uppercase tracking-tight">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-4 mt-3">
                <span className="text-2xl font-light text-[#111111]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm line-through text-[#6B6B6B]">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs uppercase tracking-widest text-[#6B6B6B]">
                  Tax & Duties Included
                </span>
              </div>
              <p className="mt-4 text-sm text-[#111111] font-light leading-relaxed italic font-editorial">
                &ldquo;{product.subtitle}&rdquo;
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-widest text-[#111111] font-medium">
                <span>Color: {selectedColor.name}</span>
                <span className="text-[#6B6B6B]">3 Finishes</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 px-3 py-2 border text-xs tracking-wider transition-all ${
                      selectedColor.name === color.name
                        ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                        : "border-[#D8D5CF] text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-widest text-[#111111] font-medium">
                <span>Size</span>
                <button
                  type="button"
                  className="text-[#6B6B6B] underline hover:text-[#111111] text-[11px]"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs uppercase font-medium border transition-colors ${
                      selectedSize === size
                        ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                        : "border-[#D8D5CF] text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToBag}
                disabled={isAdded}
                className="w-full py-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag — {formatPrice(product.price)}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-[#111111] hover:text-[#F5F3EF] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Buy Now with Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Guarantees / Service Notes */}
            <div className="pt-6 border-t border-[#D8D5CF] grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#111111]" />
                <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                  Complimentary Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#111111]" />
                <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                  30-Day Atelier Returns
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#111111]" />
                <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                  Lifetime Warranty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
