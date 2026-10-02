"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matched = PRODUCTS.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.details.some((d) => d.toLowerCase().includes(q))
      );
    });

    setResults(matched);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Search Content Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full bg-[#F5F3EF] border-b border-[#D8D5CF] shadow-2xl pt-24 pb-12 px-6 sm:px-12 md:px-24"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-6 border-b border-[#111111]/15">
                <div className="flex items-center gap-4 flex-1">
                  <Search className="w-6 h-6 text-[#111111]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by product, category, or garment..."
                    className="w-full bg-transparent text-xl sm:text-2xl font-light text-[#111111] placeholder-[#6B6B6B] focus:outline-none tracking-wide"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[#111111] hover:opacity-60 transition-opacity ml-4"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Suggestions / Popular Searches */}
              {!query && (
                <div className="pt-8">
                  <span className="text-[11px] uppercase tracking-widest text-[#6B6B6B] block mb-4 font-medium">
                    Suggested Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Motion Jacket", "Tee", "Cargo", "Wool Coat", "Silk", "Accessories", "Tote"].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-3.5 py-1.5 text-xs bg-black/5 hover:bg-black/10 text-[#111111] tracking-wide transition-colors font-normal"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Results */}
              {query && (
                <div className="pt-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between pb-4 text-xs uppercase tracking-widest text-[#6B6B6B]">
                    <span>Results ({results.length})</span>
                    {results.length > 0 && <span>Press product to view</span>}
                  </div>

                  {results.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[#111111] text-base font-light">
                        No garments matched &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-xs text-[#6B6B6B] mt-1">
                        Explore our core outerwear or minimalist essentials.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                      {results.slice(0, 6).map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug}`}
                          onClick={onClose}
                          className="group flex gap-4 items-center p-2 hover:bg-black/5 transition-colors"
                        >
                          <div className="relative w-16 h-20 bg-[#EAE8E2] shrink-0 overflow-hidden">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs uppercase tracking-wider text-[#111111] font-medium truncate group-hover:opacity-75">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[#6B6B6B] truncate">
                              {item.category}
                            </span>
                            <span className="text-xs font-medium text-[#111111] mt-1">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
