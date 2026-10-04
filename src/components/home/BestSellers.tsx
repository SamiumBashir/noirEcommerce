"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Star, ShoppingBag, Check } from "lucide-react";
import { PRODUCTS, Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";

export function BestSellers() {
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller || p.rating >= 4.9);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  const handleQuickAdd = (product: Product) => {
    const success = addToCart(product, product.colors[0]?.name || "Black", product.sizes[0] || "M");
    if (success) {
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  return (
    <section className="w-full py-28 md:py-36 bg-[#F5F3EF] px-6 sm:px-12 md:px-16 border-b border-[#D8D5CF]">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-12 border-b border-[#D8D5CF] gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
              PROVEN SILHOUETTES
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-normal uppercase tracking-tight text-[#111111]">
              Best Sellers
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollLeft}
              aria-label="Previous best sellers"
              className="w-12 h-12 rounded-full border border-[#D8D5CF] flex items-center justify-center text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-[#F5F3EF] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Next best sellers"
              className="w-12 h-12 rounded-full border border-[#D8D5CF] flex items-center justify-center text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-[#F5F3EF] transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pt-12 pb-6 no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        >
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="group relative w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
            >
              {/* Product Visual */}
              <Link
                href={`/products/${product.slug}`}
                className="relative aspect-[3/4] w-full overflow-hidden bg-[#EAE8E2] block"
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  loading="lazy"
                  quality={80}
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />

                {/* Rating badge */}
                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-medium text-[#111111]">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-[#6B6B6B]">({product.reviewCount})</span>
                </div>

                {/* Quick Add Button */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAdd(product);
                    }}
                    className="w-full py-2.5 bg-[#F5F3EF] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    {addedId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Quick Add</span>
                      </>
                    )}
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="pt-3 pb-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-xs uppercase tracking-wider text-[#111111] font-medium hover:opacity-75 transition-opacity truncate"
                  >
                    {product.name}
                  </Link>
                  <span className="text-xs font-medium text-[#111111]">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <span className="text-[11px] text-[#6B6B6B] mt-0.5">
                  {product.subtitle || product.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
