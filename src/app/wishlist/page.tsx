"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/lib/context/WishlistContext";
import { ProductCard } from "@/components/ui/ProductCard";

export default function WishlistPage() {
  const { wishlistItems, wishlistCount } = useWishlist();

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-8 border-b border-[#D8D5CF]">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
            PRIVATE ARCHIVE
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal uppercase tracking-tight text-[#111111]">
              Your Wishlist
            </h1>
            <span className="text-xs uppercase tracking-widest text-[#6B6B6B]">
              {wishlistCount} Saved {wishlistCount === 1 ? "Piece" : "Pieces"}
            </span>
          </div>
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-[#6B6B6B] stroke-[1.2]" />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#111111] uppercase">
              No Pieces in Private Archive
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-2 max-w-sm">
              Curate your personal collection by clicking the heart icon on any silhouette in the atelier.
            </p>
            <Link
              href="/shop"
              className="mt-8 px-8 py-3.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 pt-12">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                aspectRatio="portrait"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
