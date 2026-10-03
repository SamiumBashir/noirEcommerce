"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

    // Use matchMedia so sticky parallax only executes on desktop screens (lg and up)
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo(
        imgWrapper,
        { scale: 0.98 },
        {
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  const handlePrevColor = () => {
    const currentIndex = product.colors.findIndex((c) => c.name === selectedColor.name);
    const prevIndex = (currentIndex - 1 + product.colors.length) % product.colors.length;
    setSelectedColor(product.colors[prevIndex]);
  };

  const handleNextColor = () => {
    const currentIndex = product.colors.findIndex((c) => c.name === selectedColor.name);
    const nextIndex = (currentIndex + 1) % product.colors.length;
    setSelectedColor(product.colors[nextIndex]);
  };

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
      className="relative w-full py-16 sm:py-24 md:py-32 lg:py-36 bg-[#F5F3EF] px-4 sm:px-8 md:px-12 lg:px-16 border-b border-[#D8D5CF] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium text-[#6B6B6B] block mb-1.5 sm:mb-2">
            IN FOCUS // ICONIC ARCHITECTURE
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight text-[#111111]">
            Interactive Showcase
          </h2>
        </div>

        {/* 2-Column Presentation: Relative on mobile, Sticky on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left Column: Large Product Image with Dynamic Swatch Switching */}
          <div className="relative lg:sticky lg:top-28 lg:col-span-7">
            <div
              ref={imageWrapperRef}
              className="relative aspect-[4/5] sm:aspect-[4/5] lg:aspect-[3/4] w-full overflow-hidden bg-[#EAE8E2] border border-[#D8D5CF] shadow-sm sm:shadow-lg rounded-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColor.name}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={selectedColor.image}
                    alt={`${product.name} in ${selectedColor.name}`}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 55vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Arrows for Mobile & Touch Quick Navigation */}
              {product.colors.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevColor}
                    aria-label="Previous colorway"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#111111] shadow-md transition-all active:scale-90 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextColor}
                    aria-label="Next colorway"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#111111] shadow-md transition-all active:scale-90 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Color Label Pill with color swatch indicator */}
              <div className="absolute bottom-3.5 left-3.5 sm:bottom-6 sm:left-6 z-10 bg-[#111111]/85 backdrop-blur-md text-[#F5F3EF] px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest font-mono flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full border border-white/30 shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span>COLORWAY: {selectedColor.name}</span>
              </div>

              {/* Mobile Color Dots on image */}
              <div className="absolute bottom-3.5 right-3.5 z-10 flex items-center gap-1.5 bg-[#111111]/70 backdrop-blur-md px-2.5 py-1.5 rounded-full sm:hidden">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color.name}`}
                    className={`w-2.5 h-2.5 rounded-full transition-transform ${
                      selectedColor.name === color.name
                        ? "scale-125 ring-1.5 ring-white"
                        : "opacity-60"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Product Information */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-8">
            {/* Title & Price */}
            <div className="border-b border-[#D8D5CF] pb-6 sm:pb-8">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#6B6B6B] block mb-1.5 sm:mb-2">
                MODEL NO. 09 // MENSWEAR
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#111111] uppercase tracking-tight leading-tight">
                {product.name}
              </h3>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-2.5 sm:mt-3">
                <span className="text-xl sm:text-2xl font-light text-[#111111]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs sm:text-sm line-through text-[#6B6B6B]">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#6B6B6B]">
                  Tax & Duties Included
                </span>
              </div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#111111] font-light leading-relaxed italic font-editorial">
                &ldquo;{product.subtitle}&rdquo;
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider sm:tracking-widest text-[#111111] font-medium">
                <span>Color: {selectedColor.name}</span>
                <span className="text-[#6B6B6B] text-[11px] sm:text-xs">
                  {product.colors.length} Finishes
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`flex-1 min-w-[90px] sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:py-2 border text-[11px] sm:text-xs tracking-wider transition-all min-h-[42px] active:scale-[0.98] ${
                      selectedColor.name === color.name
                        ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                        : "border-[#D8D5CF] text-[#111111] hover:border-[#111111] bg-white/40"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider sm:tracking-widest text-[#111111] font-medium">
                <span>Size: {selectedSize}</span>
                <button
                  type="button"
                  className="text-[#6B6B6B] underline hover:text-[#111111] text-[11px]"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 sm:py-3 text-xs uppercase font-medium border transition-all min-h-[44px] flex items-center justify-center active:scale-95 ${
                      selectedSize === size
                        ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                        : "border-[#D8D5CF] text-[#111111] hover:border-[#111111] bg-white/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
              <button
                onClick={handleAddToBag}
                disabled={isAdded}
                className="w-full py-3.5 sm:py-4 bg-[#111111] text-[#F5F3EF] text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-medium hover:bg-black active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm min-h-[46px]"
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
                className="w-full py-3.5 sm:py-4 border border-[#111111] text-[#111111] text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-medium hover:bg-[#111111] hover:text-[#F5F3EF] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 min-h-[46px]"
              >
                <span>Buy Now with Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Guarantees / Service Notes */}
            <div className="pt-5 sm:pt-6 border-t border-[#D8D5CF] grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111111] shrink-0" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6B6B6B] leading-tight">
                  Complimentary Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111111] shrink-0" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6B6B6B] leading-tight">
                  30-Day Returns
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111111] shrink-0" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6B6B6B] leading-tight">
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
