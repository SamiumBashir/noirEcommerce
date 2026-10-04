"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headline = "DESIGNED FOR THOSE WHO MOVE DIFFERENTLY.";
  const words = headline.split(" ");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Disable parallax on mobile to prevent forced reflows and scroll jank
    if (prefersReducedMotion || window.innerWidth < 1024) return;

    const container = containerRef.current;
    const imgEl = imageRef.current;
    if (!container || !imgEl) return;

    const ctx = gsap.context(() => {
      // Subtle parallax & scale while scrolling down
      gsap.to(imgEl, {
        scale: 1.12,
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[700px] flex items-end pb-16 sm:pb-20 md:pb-24 px-6 sm:px-12 md:px-16 overflow-hidden bg-[#111111]"
    >
      {/* Background Hero Image with Priority & Responsive Sizes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div ref={imageRef} className="relative w-full h-[120%] -top-[10%]">
          <Image
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&auto=format&fit=crop"
            alt="NOIR Autumn/Winter Editorial Campaign"
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover object-center filter brightness-[0.72] contrast-[1.08]"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Editorial Subtitle / Season */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-[1px] bg-white/60" />
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-white/80">
            AUTUMN / WINTER ATELIER 2026
          </span>
        </div>

        {/* Staggered Word Headline */}
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal leading-[1.05] tracking-tight uppercase max-w-5xl">
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em] last:mr-0">
              {word}
            </span>
          ))}
        </h1>

        {/* Supporting Copy & CTAs */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-white/20">
          <p className="text-white/70 text-xs sm:text-sm font-light max-w-md leading-relaxed tracking-wide">
            A sartorial study in sculptural proportion, technical fabrications, and kinetic ergonomics. Engineered for effortless movement.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="group px-7 py-3.5 bg-[#F5F3EF] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-white transition-all duration-300 flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/lookbook"
              className="px-6 py-3.5 border border-white/40 text-white text-xs uppercase tracking-widest font-medium hover:bg-white/10 transition-colors"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator prompt */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-widest">
        <span>Scroll</span>
        <ArrowDown className="w-3 h-3 animate-bounce" />
      </div>
    </section>
  );
}
