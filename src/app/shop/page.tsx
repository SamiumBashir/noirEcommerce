"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  LayoutGrid,
  Columns2,
  Check,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, Product } from "@/lib/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/utils";
import { mergeWithCustomProducts } from "@/lib/utils/productStorage";

// Category definitions
const CATEGORIES = ["ALL", "MEN", "WOMEN", "ACCESSORIES", "NEW ARRIVALS"] as const;
const DEFAULT_MAX_PRICE = 2500;

// Palette definitions with smart substring matching
const COLOR_PALETTES = [
  { id: "ALL", name: "All Tones", hex: "transparent", matches: [] },
  { id: "black", name: "Noir / Black", hex: "#111111", matches: ["black", "noir", "onyx", "stealth"] },
  { id: "charcoal", name: "Charcoal / Grey", hex: "#3A3A3C", matches: ["charcoal", "grey", "slate", "melange"] },
  { id: "bone", name: "Bone / Chalk", hex: "#E8E4DC", matches: ["bone", "chalk", "ivory", "cream", "white", "alabaster", "stone"] },
  { id: "olive", name: "Olive / Sage", hex: "#3E4338", matches: ["olive", "sage"] },
  { id: "camel", name: "Camel / Tan", hex: "#A37854", matches: ["camel", "tan", "umber", "taupe", "oatmeal"] },
  { id: "navy", name: "Indigo / Navy", hex: "#1C2436", matches: ["indigo", "navy", "midnight"] },
  { id: "silver", name: "Silver", hex: "#D4D4D8", matches: ["silver"] },
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "One Size"];
const FOOTWEAR_SIZES = ["40", "41", "42", "43", "44", "45"];
const TAILORING_SIZES = ["28", "30", "32", "34", "36"];

const FEATURED_CAPSULE_IDS = [
  "noir-motion-jacket",
  "sculptural-wool-coat",
  "subversion-wool-blazer",
  "shadow-oversized-tee",
  "liquid-crepe-column-dress",
  "monolith-leather-tote",
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isFeaturedCapsule = searchParams.get("filter") === "featured";

  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      return mergeWithCustomProducts(PRODUCTS);
    }
    return PRODUCTS;
  });
  const [category, setCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string>("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(DEFAULT_MAX_PRICE);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 4>(4);

  // Sync latest catalog pieces from local storage & backend API
  useEffect(() => {
    setAllProducts((prev) => mergeWithCustomProducts(prev.length > 0 ? prev : PRODUCTS));

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllProducts(mergeWithCustomProducts(data.data));
        }
      })
      .catch(() => {});
  }, []);

  // Sync category & filter from URL query params
  useEffect(() => {
    const cat = searchParams.get("category");
    const filter = searchParams.get("filter");

    if (filter === "new") {
      setCategory("NEW ARRIVALS");
    } else if (filter === "featured") {
      setSortBy("featured");
    } else if (cat) {
      const match = CATEGORIES.find(
        (c) => c.toLowerCase() === cat.toLowerCase()
      );
      if (match) {
        setCategory(match);
      }
    } else {
      setCategory("ALL");
    }
  }, [searchParams]);

  // Update URL search query cleanly when category changes
  const handleCategorySelect = (newCat: string) => {
    setCategory(newCat);
    const params = new URLSearchParams(searchParams.toString());
    if (newCat === "ALL") {
      params.delete("category");
      params.delete("filter");
    } else if (newCat === "NEW ARRIVALS") {
      params.delete("category");
      params.set("filter", "new");
    } else {
      params.delete("filter");
      params.set("category", newCat.toLowerCase());
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Toggle size filter
  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setCategory("ALL");
    setSearchQuery("");
    setSelectedSizes([]);
    setSelectedPalette("ALL");
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSortBy("featured");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("filter");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // Dynamic live counts for category badges
  const categoryCounts = useMemo(() => {
    return {
      ALL: allProducts.length,
      MEN: allProducts.filter((p) => (p.category || "").toUpperCase() === "MEN").length,
      WOMEN: allProducts.filter((p) => (p.category || "").toUpperCase() === "WOMEN").length,
      ACCESSORIES: allProducts.filter((p) => (p.category || "").toUpperCase() === "ACCESSORIES").length,
      "NEW ARRIVALS": allProducts.filter((p) => p.isNew || (p.category || "").toUpperCase() === "NEW ARRIVALS").length,
    };
  }, [allProducts]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Featured capsule filter
      if (isFeaturedCapsule) {
        if (!product.isFeatured && !FEATURED_CAPSULE_IDS.includes(product.id)) {
          return false;
        }
      }

      // Category filter
      if (category !== "ALL") {
        const prodCat = (product.category || "").toUpperCase();
        if (category === "NEW ARRIVALS") {
          if (!product.isNew && prodCat !== "NEW ARRIVALS") return false;
        } else if (prodCat !== category.toUpperCase()) {
          return false;
        }
      }

      // Keyword Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (product.name || "").toLowerCase().includes(q);
        const matchesSubtitle = (product.subtitle || "").toLowerCase().includes(q);
        const matchesCategory = (product.category || "").toLowerCase().includes(q);
        const matchesDetails = (product.details || []).some((d) => d && d.toLowerCase().includes(q));
        if (!matchesName && !matchesSubtitle && !matchesCategory && !matchesDetails) return false;
      }

      // Price limit
      if (maxPrice < DEFAULT_MAX_PRICE && product.price > maxPrice) {
        return false;
      }

      // Sizes filter
      if (selectedSizes.length > 0) {
        const hasSize = (product.sizes || []).some((s) => selectedSizes.includes(s));
        if (!hasSize) return false;
      }

      // Color Palette filter
      if (selectedPalette !== "ALL") {
        const palette = COLOR_PALETTES.find((cp) => cp.id === selectedPalette);
        if (palette && palette.matches.length > 0) {
          const matchesColor = (product.colors || []).some((color) => {
            const cName = (color?.name || "").toLowerCase();
            return palette.matches.some((kw) => cName.includes(kw));
          });
          if (!matchesColor) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
      if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // featured
    });
  }, [allProducts, category, searchQuery, maxPrice, selectedSizes, selectedPalette, sortBy, isFeaturedCapsule]);

  // Check if any filter is active
  const hasActiveFilters =
    category !== "ALL" ||
    isFeaturedCapsule ||
    selectedSizes.length > 0 ||
    selectedPalette !== "ALL" ||
    maxPrice < DEFAULT_MAX_PRICE ||
    searchQuery.trim().length > 0;

  const activePaletteObj = COLOR_PALETTES.find((cp) => cp.id === selectedPalette);

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF] pt-28 pb-32 px-4 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="pb-8 border-b border-[#D8D5CF]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block">
              CATALOG // COMPLETE CANON
            </span>
            <span className="text-[11px] text-[#A8A49C]">•</span>
            <span className="text-[11px] font-mono text-[#6B6B6B]">
              {allProducts.length} SILHOUETTES
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-editorial text-4xl sm:text-6xl font-normal uppercase tracking-tight text-[#111111]">
                Atelier Shop
              </h1>
              <p className="text-xs text-[#6B6B6B] mt-2 font-light max-w-md">
                Architectural tailoring, heavyweight cotton jersey, and Italian virgin wool outerwear. Crafted in limited numbers.
              </p>
            </div>

            {/* View Mode Density Toggle */}
            <div className="hidden sm:flex items-center gap-2 border border-[#D8D5CF] p-1 bg-white">
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 transition-colors ${
                  gridCols === 4
                    ? "bg-[#111111] text-[#F5F3EF]"
                    : "text-[#6B6B6B] hover:text-[#111111]"
                }`}
                title="Compact Grid (4 Columns)"
                aria-label="Compact Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 transition-colors ${
                  gridCols === 2
                    ? "bg-[#111111] text-[#F5F3EF]"
                    : "text-[#6B6B6B] hover:text-[#111111]"
                }`}
                title="Editorial Large Grid (2 Columns)"
                aria-label="Editorial Large Grid"
              >
                <Columns2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Curated Capsule Notice if filtered by collection */}
        {isFeaturedCapsule && (
          <div className="mt-6 p-4 sm:p-5 bg-[#111111] text-[#F5F3EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/50 block">
                CURATED CAPSULE // AUTUMN / WINTER ATELIER 2026
              </span>
              <p className="text-sm font-editorial uppercase tracking-wider text-white mt-1">
                Featured Collection ({filteredProducts.length} Silhouettes)
              </p>
            </div>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("filter");
                const q = params.toString();
                router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
              }}
              className="text-xs uppercase tracking-widest text-white/80 hover:text-white underline underline-offset-4 self-start sm:self-auto transition-colors"
            >
              View Full Catalog ({allProducts.length} Silhouettes)
            </button>
          </div>
        )}

        {/* Category Navigation Bar (Top Level Access) */}
        <div className="py-4 border-b border-[#D8D5CF] flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat];
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex-shrink-0 px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all relative ${
                  isActive
                    ? "text-[#111111] font-semibold bg-[#EAE8E2]"
                    : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#EAE8E2]/50"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`ml-2 text-[10px] font-mono ${
                    isActive ? "text-[#111111]" : "text-[#8E8B82]"
                  }`}
                >
                  ({count})
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Control & Secondary Bar */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#D8D5CF]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`px-4 py-2 border text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 ${
                filtersOpen
                  ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                  : "border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F5F3EF] bg-transparent"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{filtersOpen ? "Close Filters" : "Filter Catalog"}</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>

            {/* Quick Reset All Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1.5 transition-colors underline decoration-dotted"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-[#6B6B6B]">
            <span className="font-mono text-[#111111]">
              {filteredProducts.length}{" "}
              <span className="text-[#6B6B6B] font-sans">
                {filteredProducts.length === 1 ? "Silhouette" : "Silhouettes"}
              </span>
            </span>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[#8E8B82]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#111111] border-b border-[#111111] pb-0.5 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Strip */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="py-3 flex flex-wrap items-center gap-2 border-b border-[#D8D5CF]/80 text-xs"
            >
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#8E8B82] mr-1">
                Active:
              </span>

              {/* Category chip */}
              {category !== "ALL" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D8D5CF] text-[#111111] text-[11px] uppercase tracking-wider">
                  Category: {category}
                  <button
                    onClick={() => handleCategorySelect("ALL")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Search query chip */}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D8D5CF] text-[#111111] text-[11px]">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Palette chip */}
              {selectedPalette !== "ALL" && activePaletteObj && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D8D5CF] text-[#111111] text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: activePaletteObj.hex }}
                  />
                  {activePaletteObj.name}
                  <button
                    onClick={() => setSelectedPalette("ALL")}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Size chips */}
              {selectedSizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D8D5CF] text-[#111111] text-[11px]"
                >
                  Size: {s}
                  <button
                    onClick={() => handleSizeToggle(s)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Max price chip */}
              {maxPrice < DEFAULT_MAX_PRICE && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D8D5CF] text-[#111111] text-[11px]">
                  Under {formatPrice(maxPrice)}
                  <button
                    onClick={() => setMaxPrice(DEFAULT_MAX_PRICE)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#6B6B6B] hover:text-[#111111] ml-auto underline"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-b border-[#D8D5CF] py-8 bg-[#EAE8E2]/60 px-6 sm:px-8 my-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1. Keyword Search */}
                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#111111] block">
                    Keyword Search
                  </span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6B6B6B]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. wool, cashmere, trench"
                      className="w-full bg-white border border-[#D8D5CF] pl-9 pr-8 py-2 text-xs text-[#111111] placeholder-[#8E8B82] focus:outline-none focus:border-[#111111]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-[#6B6B6B] hover:text-[#111111]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B6B6B]">
                    Searches titles, descriptions, materials, and categories.
                  </p>
                </div>

                {/* 2. Color Palette Swatches */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-[#111111]">
                      Palette
                    </span>
                    {selectedPalette !== "ALL" && (
                      <button
                        onClick={() => setSelectedPalette("ALL")}
                        className="text-[10px] text-[#6B6B6B] hover:text-[#111111] underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_PALETTES.map((pal) => {
                      const isSelected = selectedPalette === pal.id;
                      return (
                        <button
                          key={pal.id}
                          onClick={() => setSelectedPalette(pal.id)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs text-left border transition-colors ${
                            isSelected
                              ? "border-[#111111] bg-white font-medium shadow-sm"
                              : "border-[#D8D5CF] bg-white/70 hover:bg-white text-[#4A4A4A]"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/25 flex-shrink-0"
                            style={{
                              backgroundColor: pal.id === "ALL" ? "transparent" : pal.hex,
                              background: pal.id === "ALL" ? "conic-gradient(#111, #888, #eee, #111)" : pal.hex,
                            }}
                          />
                          <span className="text-[11px] truncate flex-1">{pal.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#111111] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Sizes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-[#111111]">
                      Sizes
                    </span>
                    {selectedSizes.length > 0 && (
                      <button
                        onClick={() => setSelectedSizes([])}
                        className="text-[10px] text-[#6B6B6B] hover:text-[#111111] underline"
                      >
                        Clear ({selectedSizes.length})
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8E8B82] block mb-1">
                      Apparel & Universal
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {STANDARD_SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSizeToggle(s)}
                          className={`px-2.5 py-1 text-xs border font-medium transition-colors ${
                            selectedSizes.includes(s)
                              ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                              : "border-[#D8D5CF] bg-white text-[#111111] hover:border-[#111111]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E8B82] block mb-1">
                      Footwear & Tailoring
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[...TAILORING_SIZES, ...FOOTWEAR_SIZES].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSizeToggle(s)}
                          className={`min-w-[1.75rem] px-1.5 py-0.5 text-[11px] border font-mono transition-colors ${
                            selectedSizes.includes(s)
                              ? "border-[#111111] bg-[#111111] text-[#F5F3EF]"
                              : "border-[#D8D5CF] bg-white text-[#111111] hover:border-[#111111]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Price Range */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] uppercase tracking-widest font-semibold text-[#111111]">
                    <span>Maximum Price</span>
                    <span className="font-mono">{formatPrice(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max={DEFAULT_MAX_PRICE}
                    step="25"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#111111] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B6B6B] font-mono">
                    <span>$50</span>
                    <span>{formatPrice(DEFAULT_MAX_PRICE)}</span>
                  </div>
                  <p className="text-[10px] text-[#6B6B6B] pt-1">
                    Showing atelier pieces across our complete price spectrum.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center border-b border-[#D8D5CF]">
            <p className="font-editorial text-2xl text-[#111111] uppercase">
              No Silhouettes Found
            </p>
            <p className="text-xs text-[#6B6B6B] mt-2 max-w-sm mx-auto">
              No garments currently match your exact filter combination.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => handleCategorySelect("ALL")}
                className="px-6 py-2.5 border border-[#111111] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-[#111111] hover:text-[#F5F3EF] transition-colors"
              >
                View Full Canon ({allProducts.length})
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-x-6 gap-y-12 pt-8 ${
              gridCols === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {filteredProducts.map((product) => (
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F3EF] pt-32 text-center text-xs uppercase tracking-widest">
          Loading Atelier...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
