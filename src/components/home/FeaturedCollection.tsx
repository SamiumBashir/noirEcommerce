"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCTS, Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";

gsap.registerPlugin(ScrollTrigger);

export function FeaturedCollection() {
  const targetIds = [
    "noir-motion-jacket",
    "sculptural-wool-coat",
    "subversion-wool-blazer",
    "shadow-oversized-tee",
    "liquid-crepe-column-dress",
    "monolith-leather-tote",
  ];

  const featuredProducts = PRODUCTS.filter((p) => targetIds.includes(p.id));
  const { addToCart } = useCart();

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 1024;

    const section = sectionRef.current;
    const track = trackRef.current;
    const header = headerRef.current;
    if (!section || !track || prefersReducedMotion || isMobile) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".featured-card", section);
      const cardInners = gsap.utils.toArray<HTMLElement>(".featured-card-inner", section);
      const modelWrappers = gsap.utils.toArray<HTMLElement>(".model-img-wrapper", section);

      // 1. Entrance animation as section comes into full view (timing synchronized with scroll entry)
      if (header) {
        gsap.fromTo(
          header,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%", // Starts gracefully as section enters viewport
              end: "top 30%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Staggered card & model entrance rising smoothly from down to up
      gsap.fromTo(
        cards,
        { y: 70, opacity: 0.15 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 25%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // On mobile devices, allow touch horizontal scroll without pin lock
      if (isMobile) return;

      const totalScroll = track.scrollWidth - window.innerWidth + 120;

      // 2. Pin Timeline: Horizontal slide with continuous down-to-up model parallax while scrolling down
      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${totalScroll * 1.2}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setScrollPercent(Math.round(self.progress * 100));
          },
        },
      });

      // Horizontal track glide
      pinTimeline.to(
        track,
        {
          x: () => -totalScroll,
          ease: "none",
        },
        0
      );

      // Model images vertical parallax: glides smoothly from down to up inside each card as user scrolls down!
      modelWrappers.forEach((wrapper) => {
        pinTimeline.fromTo(
          wrapper,
          { y: 45 },
          {
            y: -45,
            ease: "none",
          },
          0
        );
      });

      // Subtle card elevation wave moving from down to up across the sequence
      cardInners.forEach((inner, i) => {
        const targetLift = i % 2 === 0 ? -24 : -40;
        pinTimeline.fromTo(
          inner,
          { y: 20 },
          {
            y: targetLift,
            ease: "sine.inOut",
          },
          0
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#111111] text-[#F5F3EF] overflow-hidden py-24 lg:py-0 lg:h-screen lg:flex lg:flex-col lg:justify-between"
    >
      {/* Top Header & Progress */}
      <div
        ref={headerRef}
        className="max-w-7xl mx-auto w-full px-6 sm:px-12 md:px-16 lg:pt-16 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 z-20 will-change-transform"
      >
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-white/50 block mb-2">
            CURATED CAPSULE
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-normal uppercase tracking-tight text-white">
            Featured Collection
          </h2>
        </div>

        {/* Progress bar (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-white/50">
          <span>01</span>
          <div className="w-36 h-[2px] bg-white/20 relative overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-white transition-all duration-150 ease-out"
              style={{ width: `${Math.max(scrollPercent, 10)}%` }}
            />
          </div>
          <span>0{featuredProducts.length}</span>
        </div>
      </div>

      {/* Horizontal Scrolling Track */}
      <div className="w-full overflow-x-auto lg:overflow-visible no-scrollbar px-6 sm:px-12 md:px-16 lg:px-24">
        <div
          ref={trackRef}
          className="flex gap-8 md:gap-12 w-max items-center pb-8 lg:pb-16"
        >
          {featuredProducts.map((product, idx) => (
            <div
              key={product.id}
              className="featured-card group relative w-[280px] sm:w-[340px] md:w-[400px] shrink-0 flex flex-col will-change-transform"
            >
              <div className="featured-card-inner flex flex-col w-full h-full will-change-transform">
                {/* Product Visual */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#1A1A1A] block"
                >
                  {/* Model Image Wrapper for Down-to-Up Parallax */}
                  <div className="model-img-wrapper relative w-full h-[125%] -top-[12.5%] will-change-transform">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 280px, 400px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-95"
                    />
                  </div>

                  {/* Index tag */}
                  <div className="absolute top-4 left-4 z-10 text-[10px] font-mono tracking-widest text-white/60 bg-black/40 backdrop-blur-sm px-2 py-0.5">
                    0{idx + 1} // ARCHIVE
                  </div>

                  {/* Hover overlay quick add */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product, product.colors[0]?.name || "Black", product.sizes[0] || "M");
                      }}
                      className="w-full py-3 bg-[#F5F3EF] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Quick Add — {formatPrice(product.price)}</span>
                    </button>
                  </div>
                </Link>

                {/* Info Bottom */}
                <div className="pt-4 flex items-baseline justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-medium uppercase tracking-wider text-white hover:text-white/70 transition-colors block truncate"
                    >
                      {product.name}
                    </Link>
                    <span className="text-[11px] text-white/50 uppercase tracking-widest mt-0.5 block">
                      {product.subtitle || product.category}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white/90">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Final End Card leading to Full Shop */}
          <div className="featured-card w-[280px] sm:w-[320px] aspect-[3/4.2] shrink-0 border border-white/20 flex flex-col justify-between p-8 bg-white/[0.02] will-change-transform">
            <div className="featured-card-inner flex flex-col justify-between w-full h-full will-change-transform">
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                DISCOVER FULL CANON
              </span>

              <div className="space-y-4">
                <h3 className="font-editorial text-3xl font-light leading-snug">
                  Every silhouette calibrated for movement.
                </h3>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white border-b border-white pb-1 hover:gap-3 transition-all"
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <span className="text-[10px] font-mono text-white/30">
                NOIR ATELIER COLLECTION 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="hidden lg:flex max-w-7xl mx-auto w-full px-6 sm:px-12 md:px-16 pb-8 items-center justify-between text-[11px] text-white/40 tracking-wider">
        <span>SCROLL DOWN TO TRAVERSE CAPSULE</span>
        <span>DRAG TO EXPLORE OR CLICK FOR FULL DETAILS</span>
      </div>
    </section>
  );
}
