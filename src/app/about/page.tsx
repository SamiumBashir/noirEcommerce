"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { SlideUp } from "@/components/animations/SlideUp";

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F5F3EF] text-[#111111] pt-28 pb-32">
      {/* Editorial Title */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 pb-20 border-b border-[#D8D5CF]">
        <span className="text-[11px] uppercase tracking-[0.35em] font-medium text-[#6B6B6B] block mb-3">
          ATELIER MANIFESTO
        </span>
        <Reveal direction="up">
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-normal uppercase tracking-tight text-[#111111] max-w-4xl">
            Designed for those who move differently.
          </h1>
        </Reveal>
        <p className="mt-8 text-xl sm:text-2xl text-[#111111] font-light max-w-2xl font-editorial leading-relaxed">
          NOIR is an independent luxury atelier exploring the intersection of architectural structure and kinetic ergonomics.
        </p>
      </section>

      {/* Hero Visual Plate */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-20">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EAE8E2] border border-[#D8D5CF]">
          <Image
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=85&w=1800&auto=format&fit=crop"
            alt="NOIR Atelier Architecture & Precision Cutting"
            fill
            priority
            sizes="100vw"
            className="object-cover filter contrast-[1.04]"
          />
        </div>
        <div className="mt-4 flex justify-between text-[11px] text-[#6B6B6B] uppercase font-mono tracking-widest">
          <span>PARISIAN ATELIER // STUDY NO. 01</span>
          <span>DISCIPLINE OVER EXCESS</span>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-20 border-t border-[#D8D5CF]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <span className="text-xs font-mono text-[#6B6B6B]">01 // MATERIALITY</span>
            <h3 className="font-editorial text-2xl uppercase tracking-tight">
              Japanese Bonded & Italian Wool
            </h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed font-light">
              We exclusively commission custom yarns from micro-mills across Wakayama, Japan and Biella, Italy. Every textile must demonstrate superior tactile density, water-repellent resilience, and structural memory.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-mono text-[#6B6B6B]">02 // KINEMATICS</span>
            <h3 className="font-editorial text-2xl uppercase tracking-tight">
              Ergonomic Articulation
            </h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed font-light">
              Movement is our primary design constraint. We eliminate constrictive seams through engineered raglan curves, back shoulder gussets, and knife-pleated knee articulation that moves with absolute fluidity.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-mono text-[#6B6B6B]">03 // PERMANENCE</span>
            <h3 className="font-editorial text-2xl uppercase tracking-tight">
              Anti-Seasonal Canon
            </h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed font-light">
              We reject the wasteful churn of fast-fashion calendars. Our garments are developed over 18-month cycles and maintained in an enduring perpetual canon with complimentary lifetime repair guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Dual Photo Composition & Philosophy */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-20 border-t border-[#D8D5CF]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 relative aspect-[4/5] overflow-hidden bg-[#EAE8E2]">
            <Image
              src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=85&w=1200&auto=format&fit=crop"
              alt="Sculptural Detail"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-6 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#6B6B6B] block">
              FOUNDERS NOTE
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl uppercase tracking-tight">
              Black is not darkness. It is absolute focus.
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed font-light">
              In a world crowded with transient noise, loud logos, and disposable novelties, NOIR stands as a monument to restraint. When you eliminate all unnecessary decoration, what remains must be flawless.
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
              >
                <span>Experience The Wardrobe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
