"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data/products";

export function CategorySection() {
  return (
    <section className="w-full bg-[#111111] text-[#F5F3EF] py-28 md:py-36 px-6 sm:px-12 md:px-16 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 border-b border-white/10 gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-white/50 block mb-2">
              DEPARTMENTS
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-normal uppercase tracking-tight text-white">
              Explore By Category
            </h2>
          </div>
          <p className="text-xs text-white/60 max-w-sm font-light">
            Architectural garments and sensory materials categorized for purposeful discovery.
          </p>
        </div>

        {/* Large Visual Category Editorial Blocks (2x2 grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-12">
          {CATEGORIES.map((category) => (
            <Link
              key={category.name}
              href={`/shop?category=${category.slug}`}
              className="group relative h-[420px] sm:h-[500px] overflow-hidden block bg-[#1A1A1A]"
            >
              {/* Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-108 filter brightness-[0.78] contrast-[1.05]"
              />

              {/* Darkening Overlay */}
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-500" />

              {/* Content Panel */}
              <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between z-10">
                {/* Top Badge */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-widest text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1">
                    {category.itemCount}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#111111] transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Typography with Motion */}
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-white/60 block mb-1">
                    {category.headline}
                  </span>
                  <h3 className="font-editorial text-4xl sm:text-5xl font-normal text-white uppercase tracking-tight">
                    {category.name}
                  </h3>
                  <p className="text-xs text-white/70 mt-2 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-light leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
