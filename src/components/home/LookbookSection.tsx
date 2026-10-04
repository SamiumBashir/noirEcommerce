"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Eye, X, Sparkles, Compass } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { LOOKBOOK_ITEMS, LookbookItem, PRODUCTS, Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";

gsap.registerPlugin(ScrollTrigger);

export function LookbookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModalLook, setActiveModalLook] = useState<LookbookItem | null>(null);
  const { addToCart } = useCart();
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  // Smooth cinematic internal image parallax (cards remain perfectly stationary while photos float inside)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || window.innerWidth < 1024) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const parallaxImages = container.querySelectorAll<HTMLElement>(".lookbook-parallax-img");
      parallaxImages.forEach((imgEl) => {
        const parentCard = imgEl.closest(".lookbook-card");
        gsap.fromTo(
          imgEl,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: parentCard || container,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  const getGarmentsForLook = (slugs: string[]): Product[] => {
    return PRODUCTS.filter((p) => slugs.includes(p.slug));
  };

  const handleQuickAddGarment = (product: Product) => {
    const defaultColor = product.colors[0]?.name || "Black";
    const defaultSize = product.sizes[0] || "M";
    const success = addToCart(product, defaultColor, defaultSize, 1);
    if (success) {
      setAddedSlug(product.slug);
      setTimeout(() => setAddedSlug(null), 1500);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 md:py-36 bg-[#111111] text-[#F5F3EF] px-6 sm:px-12 md:px-16 overflow-hidden border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Staggered Motion */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-14 border-b border-white/10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-white/50 block">
                CAMPAIGN MONOGRAPHS // SS26
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                4 ARCHITECTURAL ACTS
              </span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-none">
              The Lookbook
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/lookbook"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/90 hover:text-white border-b border-white pb-1 hover:gap-3 transition-all duration-300"
            >
              <span>View Complete Editorial</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Balanced Editorial Magazine Grid (Zero Blank Spaces, Pure Cinematic Depth) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-14 items-start">
          {/* Column 1 (Left): Act 1 (Tall) + Act 2 (Horizontal) */}
          <div className="space-y-8 lg:space-y-12">
            {/* 1. Act I (Tokyo - Tall 3:4) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="lookbook-card group relative aspect-[3/4] overflow-hidden bg-[#181818] border border-white/10 shadow-2xl"
            >
              {/* Parallax Floating Image Window */}
              <div className="lookbook-parallax-img relative w-full h-[116%] -top-[8%]">
                <Image
                  src={LOOKBOOK_ITEMS[0].image}
                  alt={LOOKBOOK_ITEMS[0].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-106 filter brightness-95"
                />
              </div>

              {/* Top Location & Act Badge */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/75 backdrop-blur-md border border-white/20 text-white font-semibold uppercase shadow-md">
                  {LOOKBOOK_ITEMS[0].act}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/55 backdrop-blur-md border border-white/10 text-white/80">
                  {LOOKBOOK_ITEMS[0].location}
                </span>
              </div>

              {/* Information Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent p-6 sm:p-8 flex flex-col justify-end pointer-events-auto">
                <span className="text-[10px] font-mono tracking-widest text-white/60 mb-1 block">
                  {LOOKBOOK_ITEMS[0].subtitle}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide">
                  {LOOKBOOK_ITEMS[0].title}
                </h3>
                <p className="text-xs text-white/70 mt-1.5 font-light max-w-md leading-relaxed">
                  {LOOKBOOK_ITEMS[0].caption}
                </p>

                {/* Shoppable Garment Badges */}
                <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase mr-1">
                    PIECES:
                  </span>
                  {getGarmentsForLook(LOOKBOOK_ITEMS[0].garmentSlugs).map((g) => (
                    <Link
                      key={g.id}
                      href={`/products/${g.slug}`}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white text-white hover:text-black text-[11px] uppercase tracking-wider backdrop-blur-md border border-white/25 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span>{g.name}</span>
                      <span className="font-mono text-[10px] opacity-75">{formatPrice(g.price)}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    </Link>
                  ))}
                  <button
                    onClick={() => setActiveModalLook(LOOKBOOK_ITEMS[0])}
                    className="ml-auto text-[11px] text-white/80 hover:text-white underline decoration-dotted flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* 2. Act II (Berlin - Horizontal 16:10) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="lookbook-card group relative aspect-[16/10] overflow-hidden bg-[#181818] border border-white/10 shadow-2xl"
            >
              <div className="lookbook-parallax-img relative w-full h-[116%] -top-[8%]">
                <Image
                  src={LOOKBOOK_ITEMS[1].image}
                  alt={LOOKBOOK_ITEMS[1].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-106"
                />
              </div>

              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/75 backdrop-blur-md border border-white/20 text-white font-semibold uppercase shadow-md">
                  {LOOKBOOK_ITEMS[1].act}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/55 backdrop-blur-md border border-white/10 text-white/80">
                  {LOOKBOOK_ITEMS[1].location}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                <span className="text-[10px] font-mono tracking-widest text-white/60 mb-1 block">
                  {LOOKBOOK_ITEMS[1].subtitle}
                </span>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase tracking-wide">
                  {LOOKBOOK_ITEMS[1].title}
                </h3>
                <p className="text-xs text-white/70 mt-1.5 font-light max-w-md">
                  {LOOKBOOK_ITEMS[1].caption}
                </p>

                <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase mr-1">
                    PIECES:
                  </span>
                  {getGarmentsForLook(LOOKBOOK_ITEMS[1].garmentSlugs).map((g) => (
                    <Link
                      key={g.id}
                      href={`/products/${g.slug}`}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white text-white hover:text-black text-[11px] uppercase tracking-wider backdrop-blur-md border border-white/25 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span>{g.name}</span>
                      <span className="font-mono text-[10px] opacity-75">{formatPrice(g.price)}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    </Link>
                  ))}
                  <button
                    onClick={() => setActiveModalLook(LOOKBOOK_ITEMS[1])}
                    className="ml-auto text-[11px] text-white/80 hover:text-white underline decoration-dotted flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 2 (Right): Act 3 (Horizontal) + Act 4 (Tall) */}
          <div className="space-y-8 lg:space-y-12">
            {/* 3. Act III (Paris - Horizontal 16:10) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lookbook-card group relative aspect-[16/10] overflow-hidden bg-[#181818] border border-white/10 shadow-2xl"
            >
              <div className="lookbook-parallax-img relative w-full h-[116%] -top-[8%]">
                <Image
                  src={LOOKBOOK_ITEMS[2].image}
                  alt={LOOKBOOK_ITEMS[2].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-106 filter brightness-95"
                />
              </div>

              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/75 backdrop-blur-md border border-white/20 text-white font-semibold uppercase shadow-md">
                  {LOOKBOOK_ITEMS[2].act}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/55 backdrop-blur-md border border-white/10 text-white/80">
                  {LOOKBOOK_ITEMS[2].location}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                <span className="text-[10px] font-mono tracking-widest text-white/60 mb-1 block">
                  {LOOKBOOK_ITEMS[2].subtitle}
                </span>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase tracking-wide">
                  {LOOKBOOK_ITEMS[2].title}
                </h3>
                <p className="text-xs text-white/70 mt-1.5 font-light max-w-md">
                  {LOOKBOOK_ITEMS[2].caption}
                </p>

                <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase mr-1">
                    PIECES:
                  </span>
                  {getGarmentsForLook(LOOKBOOK_ITEMS[2].garmentSlugs).map((g) => (
                    <Link
                      key={g.id}
                      href={`/products/${g.slug}`}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white text-white hover:text-black text-[11px] uppercase tracking-wider backdrop-blur-md border border-white/25 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span>{g.name}</span>
                      <span className="font-mono text-[10px] opacity-75">{formatPrice(g.price)}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    </Link>
                  ))}
                  <button
                    onClick={() => setActiveModalLook(LOOKBOOK_ITEMS[2])}
                    className="ml-auto text-[11px] text-white/80 hover:text-white underline decoration-dotted flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* 4. Act IV (Reykjavik - Tall 3:4) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lookbook-card group relative aspect-[3/4] overflow-hidden bg-[#181818] border border-white/10 shadow-2xl"
            >
              <div className="lookbook-parallax-img relative w-full h-[116%] -top-[8%]">
                <Image
                  src={LOOKBOOK_ITEMS[3].image}
                  alt={LOOKBOOK_ITEMS[3].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-106"
                />
              </div>

              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/75 backdrop-blur-md border border-white/20 text-white font-semibold uppercase shadow-md">
                  {LOOKBOOK_ITEMS[3].act}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest bg-black/55 backdrop-blur-md border border-white/10 text-white/80">
                  {LOOKBOOK_ITEMS[3].location}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                <span className="text-[10px] font-mono tracking-widest text-white/60 mb-1 block">
                  {LOOKBOOK_ITEMS[3].subtitle}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide">
                  {LOOKBOOK_ITEMS[3].title}
                </h3>
                <p className="text-xs text-white/70 mt-1.5 font-light max-w-md">
                  {LOOKBOOK_ITEMS[3].caption}
                </p>

                <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase mr-1">
                    PIECES:
                  </span>
                  {getGarmentsForLook(LOOKBOOK_ITEMS[3].garmentSlugs).map((g) => (
                    <Link
                      key={g.id}
                      href={`/products/${g.slug}`}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white text-white hover:text-black text-[11px] uppercase tracking-wider backdrop-blur-md border border-white/25 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span>{g.name}</span>
                      <span className="font-mono text-[10px] opacity-75">{formatPrice(g.price)}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    </Link>
                  ))}
                  <button
                    onClick={() => setActiveModalLook(LOOKBOOK_ITEMS[3])}
                    className="ml-auto text-[11px] text-white/80 hover:text-white underline decoration-dotted flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Curator Note Full-Width Banner (Seamlessly Anchoring the Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 sm:mt-18 border border-white/15 p-8 sm:p-12 bg-white/[0.02] backdrop-blur-md relative group hover:border-white/35 transition-colors duration-500 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <span className="text-[10px] font-mono tracking-widest text-white/45 block uppercase">
                // CURATOR ATELIER NOTE
              </span>
              <p className="font-editorial text-2xl sm:text-3xl text-white leading-relaxed font-light italic">
                &ldquo;Black is not absence; it is density, discipline, and architectural clarity.&rdquo;
              </p>
            </div>
            <div className="flex flex-col sm:items-end text-xs text-white/50 uppercase tracking-widest font-mono border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <span className="text-white/85 font-medium">Seasonal Monograph</span>
              <span className="text-[11px] text-white/40 mt-1">Paris • Tokyo • Berlin • Reykjavik</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Ensemble Inspector Modal */}
      <AnimatePresence>
        {activeModalLook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalLook(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-[#181818] border border-white/20 text-[#F5F3EF] p-6 sm:p-10 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveModalLook(null)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close look inspector"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block mb-1">
                  {activeModalLook.act} // {activeModalLook.location}
                </span>
                <h3 className="font-editorial text-3xl uppercase tracking-tight text-white">
                  {activeModalLook.title}
                </h3>
                <p className="text-xs text-white/70 mt-2 font-light">
                  {activeModalLook.caption}
                </p>
              </div>

              {/* Garment Cards */}
              <div className="space-y-4 pt-2">
                <span className="text-[11px] uppercase tracking-widest text-white/50 block font-mono">
                  CURATED SILHOUETTES IN THIS ACT:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getGarmentsForLook(activeModalLook.garmentSlugs).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/[0.04] border border-white/10 p-3.5 flex flex-col justify-between space-y-3 hover:border-white/25 transition-colors"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setActiveModalLook(null)}
                          className="text-xs uppercase tracking-wider text-white font-medium hover:underline block truncate"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center justify-between text-xs text-white/60 mt-1">
                          <span>{product.category}</span>
                          <span className="font-mono text-white">{formatPrice(product.price)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleQuickAddGarment(product)}
                          className="flex-1 py-2 bg-white text-black hover:bg-white/90 text-[10px] uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{addedSlug === product.slug ? "Added" : "Quick Add"}</span>
                        </button>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setActiveModalLook(null)}
                          className="px-3 py-2 border border-white/20 hover:border-white text-[10px] uppercase tracking-widest text-white transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                <Link
                  href="/lookbook"
                  onClick={() => setActiveModalLook(null)}
                  className="text-white/70 hover:text-white underline decoration-dotted flex items-center gap-1.5"
                >
                  <span>Explore full SS26 Editorial Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setActiveModalLook(null)}
                  className="px-4 py-2 border border-white/20 text-white/80 hover:text-white text-[11px] uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
