"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/animations/Reveal";
import { SlideUp } from "@/components/animations/SlideUp";

gsap.registerPlugin(ScrollTrigger);

export function BrandStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const parallaxImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Skip heavy ScrollTrigger on mobile touch
    if (window.innerWidth < 768) return;

    const container = containerRef.current;
    const marquee = marqueeRef.current;
    const parallaxImg = parallaxImgRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Scroll-based horizontal text shift
      if (marquee) {
        gsap.fromTo(
          marquee,
          { x: 50 },
          {
            x: -120,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // Parallax on editorial image
      if (parallaxImg) {
        gsap.fromTo(
          parallaxImg,
          { y: -60 },
          {
            y: 60,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          }
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-28 md:py-40 bg-[#F5F3EF] overflow-hidden border-b border-[#D8D5CF]"
    >
      {/* Background Kinetic Big Typography Watermark */}
      <div
        ref={marqueeRef}
        aria-hidden="true"
        className="select-none pointer-events-none whitespace-nowrap text-[12vw] font-editorial text-black/[0.035] leading-none uppercase font-normal -top-4 left-0 absolute"
      >
        MOVEMENT • PRECISION • NOIR • MOVEMENT • TIMELESS
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 relative z-10">
        {/* Magazine Editorial Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start mb-20">
          <div className="lg:col-span-4">
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block mb-3">
              CHAPTER 01 / PHILOSOPHY
            </span>
            <div className="w-12 h-[1px] bg-[#111111]" />
          </div>

          <div className="lg:col-span-8">
            <Reveal direction="up">
              <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal text-[#111111] leading-[1.08] uppercase tracking-tight">
                NOT JUST CLOTHING.
              </h2>
            </Reveal>

            <SlideUp delay={0.2} className="mt-8">
              <p className="text-xl sm:text-2xl md:text-3xl text-[#111111] font-light leading-relaxed max-w-2xl font-editorial">
                NOIR is built around movement, simplicity and timeless design.
              </p>
            </SlideUp>

            <SlideUp delay={0.3} className="mt-6">
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-xl font-light">
                We reject seasonal obsolescence in favor of architectural permanence. Each garment is meticulously drafted through kinematic pattern cutting, allowing natural ease in transit while presenting an unyielding, razor-sharp silhouette.
              </p>
            </SlideUp>
          </div>
        </div>

        {/* Editorial Fashion Photography Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-8">
          {/* Main Large Editorial Image */}
          <div className="md:col-span-7 relative">
            <Reveal direction="left" duration={1.2}>
              <div className="relative aspect-[4/5] sm:aspect-[16/11] overflow-hidden bg-[#EAE8E2]">
                <div ref={parallaxImgRef} className="relative w-full h-[120%] -top-[10%]">
                  <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop"
                    alt="NOIR Editorial Magazine Silhouette"
                    fill
                    loading="lazy"
                    quality={80}
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 55vw, 60vw"
                    className="object-cover filter contrast-[1.04]"
                  />
                </div>
              </div>
            </Reveal>
            <div className="mt-3 flex justify-between text-[11px] text-[#6B6B6B] uppercase tracking-widest font-mono">
              <span>PLATE NO. 04 / KYOTO</span>
              <span>FIGURE IN DOUBLE-FACED WOOL</span>
            </div>
          </div>

          {/* Secondary Editorial Composition */}
          <div className="md:col-span-5 md:pl-8 space-y-8">
            <Reveal direction="right" delay={0.2}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EAE8E2]">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop"
                  alt="NOIR Kinetic Portrait"
                  fill
                  loading="lazy"
                  quality={80}
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 35vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-medium text-[#111111]">
                THE PRINCIPLE OF MOTION
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Garments must behave like architecture in motion. Structured enough to hold an imposing line, flexible enough to follow the velocity of modern life.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#111111] font-medium border-b border-[#111111] pb-1 hover:gap-3 transition-all"
              >
                <span>Read Full Manifesto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
