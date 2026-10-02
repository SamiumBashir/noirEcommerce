"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { StaggerContainer } from "@/components/animations/StaggerContainer";

export function ProductGridSection() {
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "MEN" | "WOMEN" | "ACCESSORIES">("ALL");

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedFilter === "ALL") return true;
    return p.category === selectedFilter;
  });

  return (
    <section className="w-full py-28 md:py-36 bg-[#F5F3EF] px-6 sm:px-12 md:px-16 border-b border-[#D8D5CF]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#D8D5CF]">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
              CURATED SELECTION
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-normal uppercase tracking-tight text-[#111111]">
              Essential Wardrobe
            </h2>
          </div>

          {/* Minimalist Filter Tabs */}
          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest">
            {(["ALL", "MEN", "WOMEN", "ACCESSORIES"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`py-1 transition-colors relative ${
                  selectedFilter === cat
                    ? "text-[#111111] font-semibold"
                    : "text-[#6B6B6B] hover:text-[#111111]"
                }`}
              >
                {cat}
                {selectedFilter === cat && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#111111]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid: 2-4 cols desktop, 1-2 mobile */}
        <div className="pt-12">
          <StaggerContainer
            key={selectedFilter}
            staggerDelay={0.06}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
          >
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                aspectRatio="portrait"
              />
            ))}
          </StaggerContainer>
        </div>

        {/* View All Link */}
        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
          >
            <span>View Full Atelier Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
