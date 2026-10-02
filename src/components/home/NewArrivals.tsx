"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/animations/Reveal";
import { StaggerContainer } from "@/components/animations/StaggerContainer";

export function NewArrivals() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew || p.category === "NEW ARRIVALS").slice(0, 3);

  return (
    <section className="w-full py-28 md:py-36 bg-[#F5F3EF] px-6 sm:px-12 md:px-16 border-b border-[#D8D5CF]">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Headline */}
        <div className="text-center max-w-3xl mx-auto pb-20">
          <span className="text-[11px] uppercase tracking-[0.35em] font-medium text-[#6B6B6B] block mb-3">
            CAPSULE 04 / WINTER PREVIEW
          </span>
          <Reveal direction="up">
            <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal uppercase tracking-tight text-[#111111]">
              THE NEW STANDARD.
            </h2>
          </Reveal>
          <p className="mt-4 text-xs sm:text-sm text-[#6B6B6B] font-light max-w-md mx-auto leading-relaxed">
            Unveiling innovative fabric textures, tailored kinetic lines, and unadorned structural clarity.
          </p>
        </div>

        {/* 3 Featured Products with Varied Image Proportions */}
        <StaggerContainer
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-end"
        >
          {/* Card 1: Tall Editorial Portrait (Col 4) */}
          {newArrivals[0] && (
            <div className="md:col-span-4 flex flex-col">
              <Link
                href={`/products/${newArrivals[0].slug}`}
                className="group relative aspect-[3/4.6] overflow-hidden bg-[#EAE8E2] block"
              >
                <Image
                  src={newArrivals[0].images[0]}
                  alt={newArrivals[0].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute top-4 left-4 bg-[#111111] text-[#F5F3EF] text-[10px] uppercase tracking-widest px-2.5 py-1">
                  NEW ARRIVAL
                </div>
              </Link>
              <div className="pt-4 flex justify-between items-baseline">
                <div>
                  <Link
                    href={`/products/${newArrivals[0].slug}`}
                    className="text-xs uppercase tracking-wider text-[#111111] font-medium hover:opacity-75"
                  >
                    {newArrivals[0].name}
                  </Link>
                  <span className="text-[11px] text-[#6B6B6B] block mt-0.5">
                    {newArrivals[0].subtitle}
                  </span>
                </div>
                <span className="text-xs font-medium text-[#111111]">
                  {formatPrice(newArrivals[0].price)}
                </span>
              </div>
            </div>
          )}

          {/* Card 2: Centerpiece Large Hero Card (Col 5) */}
          {newArrivals[1] && (
            <div className="md:col-span-5 flex flex-col md:-translate-y-8">
              <Link
                href={`/products/${newArrivals[1].slug}`}
                className="group relative aspect-[4/5] overflow-hidden bg-[#EAE8E2] block shadow-md"
              >
                <Image
                  src={newArrivals[1].images[0]}
                  alt={newArrivals[1].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute top-4 left-4 bg-[#111111] text-[#F5F3EF] text-[10px] uppercase tracking-widest px-2.5 py-1">
                  NEW ARRIVAL
                </div>
              </Link>
              <div className="pt-4 flex justify-between items-baseline">
                <div>
                  <Link
                    href={`/products/${newArrivals[1].slug}`}
                    className="text-sm uppercase tracking-wider text-[#111111] font-medium hover:opacity-75"
                  >
                    {newArrivals[1].name}
                  </Link>
                  <span className="text-xs text-[#6B6B6B] block mt-0.5">
                    {newArrivals[1].subtitle}
                  </span>
                </div>
                <span className="text-sm font-medium text-[#111111]">
                  {formatPrice(newArrivals[1].price)}
                </span>
              </div>
            </div>
          )}

          {/* Card 3: Compact Square Proportion (Col 3) */}
          {newArrivals[2] && (
            <div className="md:col-span-3 flex flex-col">
              <Link
                href={`/products/${newArrivals[2].slug}`}
                className="group relative aspect-square overflow-hidden bg-[#EAE8E2] block"
              >
                <Image
                  src={newArrivals[2].images[0]}
                  alt={newArrivals[2].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute top-4 left-4 bg-[#111111] text-[#F5F3EF] text-[10px] uppercase tracking-widest px-2.5 py-1">
                  NEW ARRIVAL
                </div>
              </Link>
              <div className="pt-4 flex justify-between items-baseline">
                <div>
                  <Link
                    href={`/products/${newArrivals[2].slug}`}
                    className="text-xs uppercase tracking-wider text-[#111111] font-medium hover:opacity-75"
                  >
                    {newArrivals[2].name}
                  </Link>
                  <span className="text-[11px] text-[#6B6B6B] block mt-0.5">
                    {newArrivals[2].subtitle}
                  </span>
                </div>
                <span className="text-xs font-medium text-[#111111]">
                  {formatPrice(newArrivals[2].price)}
                </span>
              </div>
            </div>
          )}
        </StaggerContainer>

        <div className="mt-16 text-center">
          <Link
            href="/shop?filter=new"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#111111] font-medium border-b border-[#111111] pb-1 hover:gap-3 transition-all"
          >
            <span>Explore All New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
