"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { ProductCard } from "@/components/ui/ProductCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: "Default", hex: "#111111", image: product.images[0] });
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // Accordion states
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  const isFavorited = isInWishlist(product.id);

  // Filter related products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender)
  ).slice(0, 4);

  const handleColorChange = (color: typeof product.colors[0]) => {
    setSelectedColor(color);
    const imgIndex = product.images.findIndex((img) => img === color.image);
    if (imgIndex >= 0) {
      setActiveImageIndex(imgIndex);
    }
  };

  const handleAddToCart = () => {
    const success = addToCart(product, selectedColor.name, selectedSize, quantity);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, selectedColor.name, selectedSize, quantity);
    if (success) {
      router.push("/checkout");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-6 sm:px-12 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#6B6B6B] mb-8">
          <Link href="/" className="hover:text-[#111111] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#111111] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-[#111111] transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#111111] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Main Featured Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EAE8E2] border border-[#D8D5CF]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={`${product.name} view ${activeImageIndex + 1}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[#F5F3EF]/90 backdrop-blur-md flex items-center justify-center text-[#111111] shadow-sm hover:scale-110 active:scale-95 transition-transform"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorited
                      ? "fill-[#111111] text-[#111111]"
                      : "text-[#111111] stroke-[1.5]"
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[3/4] overflow-hidden bg-[#EAE8E2] border transition-all ${
                      activeImageIndex === idx
                        ? "border-[#111111] ring-1 ring-[#111111]"
                        : "border-[#D8D5CF] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Product Information */}
          <div className="lg:col-span-5 sticky top-28 space-y-8">
            {/* Header / Category / Name / Price */}
            <div className="border-b border-[#D8D5CF] pb-6">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#6B6B6B] block mb-2">
                {product.category} // ATELIER
              </span>
              <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#111111] uppercase tracking-tight">
                {product.name}
              </h1>

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
                  In Stock ({product.stockCount} Available)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Swatches */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-widest text-[#111111] font-medium">
                <span>Color: {selectedColor.name}</span>
                <span className="text-[#6B6B6B]">{product.colors.length} Available</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color)}
                    className={`flex items-center gap-2 px-3.5 py-2 border text-xs tracking-wider transition-all ${
                      selectedColor.name === color.name
                        ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                        : "border-[#D8D5CF] text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
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
                  Size Guide & Measurements
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

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-[#111111] font-medium">
                Quantity
              </span>
              <div className="flex items-center border border-[#D8D5CF] bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#111111] hover:bg-black/5"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-medium text-[#111111]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#111111] hover:bg-black/5"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className="w-full py-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag — {formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-[#111111] hover:text-[#F5F3EF] transition-all flex items-center justify-center gap-2"
              >
                <span>Buy Now with Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#D8D5CF] pt-6 space-y-4">
              {/* Garment Details Accordion */}
              <div className="border-b border-[#D8D5CF] pb-4">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-medium text-[#111111]"
                >
                  <span>Fabric & Craftsmanship Details</span>
                  {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {detailsOpen && (
                  <ul className="mt-3 space-y-2 text-xs text-[#6B6B6B] list-disc list-inside">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="leading-relaxed font-light">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Shipping & Delivery Accordion */}
              <div className="border-b border-[#D8D5CF] pb-4">
                <button
                  onClick={() => setShippingOpen(!shippingOpen)}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-medium text-[#111111]"
                >
                  <span>Shipping & Returns</span>
                  {shippingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {shippingOpen && (
                  <div className="mt-3 text-xs text-[#6B6B6B] leading-relaxed font-light space-y-2">
                    <p>{product.shippingInfo}</p>
                    <p>30-day effortless returns with prepaid carbon-neutral label provided in box.</p>
                  </div>
                )}
              </div>

              {/* Care Instructions Accordion */}
              <div className="border-b border-[#D8D5CF] pb-4">
                <button
                  onClick={() => setCareOpen(!careOpen)}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-medium text-[#111111]"
                >
                  <span>Garment Care Instructions</span>
                  {careOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {careOpen && (
                  <div className="mt-3 text-xs text-[#6B6B6B] leading-relaxed font-light">
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Icons */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#111111]" />
                <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                  Complimentary Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#111111]" />
                <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                  30-Day Returns
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

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-[#D8D5CF]">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-2">
                  EXPLORE SIMILAR SILHOUETTES
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-normal uppercase tracking-tight text-[#111111]">
                  Complementary Pieces
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#111111] font-medium border-b border-[#111111] pb-1 hover:gap-3 transition-all"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  aspectRatio="portrait"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
