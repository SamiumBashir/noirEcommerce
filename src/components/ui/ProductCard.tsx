"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  aspectRatio?: "portrait" | "square" | "tall";
  className?: string;
}

export function ProductCard({
  product,
  aspectRatio = "portrait",
  className = "",
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "M");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop";
  const primaryImg = imgError ? fallbackImg : (product.images[0] || fallbackImg);

  const isFavorited = isInWishlist(product.id);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "tall":
        return "aspect-[3/4.2]";
      case "square":
        return "aspect-square";
      case "portrait":
      default:
        return "aspect-[3/4]";
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = product.colors[0]?.name || "Black";
    const added = addToCart(product, defaultColor, selectedSize, 1);
    if (added) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        setShowQuickAdd(false);
      }, 1200);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className={`group relative flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className={`relative w-full overflow-hidden bg-[#EAE8E2] ${getAspectClass()}`}
      >
        {/* Primary Image */}
        <Image
          src={primaryImg}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 25vw"
          className={`object-cover transition-transform duration-700 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          } ${
            product.images[1] && isHovered ? "opacity-0" : "opacity-100"
          } transition-opacity duration-500`}
          onError={() => setImgError(true)}
        />

        {/* Secondary Image on Hover */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out ${
              isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNew && (
            <span className="bg-[#111111] text-[#F5F3EF] text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium">
              New
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="bg-[#111111]/80 backdrop-blur-sm text-[#F5F3EF] text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium">
              Signature
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-[#F5F3EF]/90 backdrop-blur-sm flex items-center justify-center text-[#111111] transition-transform duration-300 hover:scale-110 active:scale-95 shadow-sm"
        >
          <motion.div
            animate={{ scale: isFavorited ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited
                  ? "fill-[#111111] text-[#111111]"
                  : "text-[#111111] stroke-[1.5]"
              }`}
            />
          </motion.div>
        </button>

        {/* Quick Add Bar - Slides up smoothly on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300 z-20 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {!showQuickAdd ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickAdd(true);
              }}
              className="w-full py-2.5 bg-[#F5F3EF] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Quick Add
            </button>
          ) : (
            <div className="bg-[#F5F3EF] p-2 flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#111111]">
                <span>SELECT SIZE</span>
                <span className="text-[#6B6B6B]">{product.colors[0]?.name}</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`min-w-[2.25rem] px-2 py-1 text-[11px] border font-medium text-center transition-colors ${
                      selectedSize === size
                        ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                        : "border-[#D8D5CF] text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                disabled={isAdded}
                className="w-full py-2 bg-[#111111] text-[#F5F3EF] text-[11px] uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center gap-1.5"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <span>Add to Bag — {formatPrice(product.price)}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="pt-3 pb-2 flex flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs uppercase tracking-wider text-[#111111] font-medium hover:opacity-70 transition-opacity truncate"
          >
            {product.name}
          </Link>
          <span className="text-xs font-medium text-[#111111] whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1 text-[11px] text-[#6B6B6B]">
          <span>{product.subtitle || product.category}</span>
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
