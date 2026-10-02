"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { LOOKBOOK_ITEMS, PRODUCTS } from "@/lib/data/products";
import { Reveal } from "@/components/animations/Reveal";
import { SlideUp } from "@/components/animations/SlideUp";

export default function LookbookPage() {
  const editorialActs = [
    {
      act: "ACT 01",
      title: "THE SILENT STRIDE",
      location: "Tokyo Metropolitan Government Building • 35.6895° N, 139.6917° E",
      description:
        "Kinetic tension expressed through heavy double-faced wool overcoats and fluid wide-leg pleats. The subject traverses brutalist monolithic concrete structures at dawn.",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=85&w=1600&auto=format&fit=crop",
      garments: ["noir-motion-jacket", "pleated-kinetic-trouser"],
    },
    {
      act: "ACT 02",
      title: "STRUCTURAL VOID",
      location: "Berlin Neue Nationalgalerie • 52.5069° N, 13.3674° E",
      description:
        "The subtraction of ornament reveals raw silhouette. Precision cuts in 320 GSM combed cotton jersey juxtaposed against technical stretch-ripstop nylon.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=85&w=1600&auto=format&fit=crop",
      garments: ["shadow-oversized-tee", "motion-cargo"],
    },
    {
      act: "ACT 03",
      title: "MONOLITHIC DRAPE",
      location: "Paris Palais de Tokyo • 48.8643° N, 2.2965° E",
      description:
        "Mulberry silk tailored into sharp geometric collars that break into liquid drapery under gallery spotlights. Weightless authority.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=85&w=1600&auto=format&fit=crop",
      garments: ["architectural-silk-shirt", "sculptural-wool-coat"],
    },
    {
      act: "ACT 04",
      title: "NOCTURNAL GRAVITY",
      location: "Reykjavik Basalt Columns • 64.1466° N, 21.9426° W",
      description:
        "Black as light absorption. Double-layered 480 GSM French terry shields against cold northern winds with zero extraneous seams.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=85&w=1600&auto=format&fit=crop",
      garments: ["eclipse-hoodie", "noir-essential-jacket"],
    },
  ];

  return (
    <div className="w-full bg-[#111111] text-[#F5F3EF]">
      {/* Editorial Cover */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-end pb-20 px-6 sm:px-12 md:px-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=85&w=2000&auto=format&fit=crop"
            alt="NOIR Autumn/Winter Editorial Campaign Cover"
            fill
            priority
            className="object-cover filter brightness-[0.6] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <SlideUp>
            <span className="text-[11px] uppercase tracking-[0.35em] text-white/60 block mb-4">
              EDITORIAL CAMPAIGN NO. 06
            </span>
          </SlideUp>

          <Reveal direction="up" delay={0.2}>
            <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-normal uppercase tracking-tight text-white leading-none">
              SHADOW & VELOCITY
            </h1>
          </Reveal>

          <SlideUp delay={0.4} className="mt-6 flex flex-col sm:flex-row justify-between sm:items-end gap-6 pt-6 border-t border-white/20">
            <p className="text-xs sm:text-sm text-white/70 max-w-md font-light leading-relaxed">
              A comprehensive photographic visual journey documenting the seasonal canon across Tokyo, Berlin, Paris, and Reykjavik.
            </p>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
              <span>Scroll to Begin</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Acts Breakdown */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-24 space-y-36">
        {editorialActs.map((act, index) => {
          const featuredGarmentObjs = PRODUCTS.filter((p) => act.garments.includes(p.id));

          return (
            <section key={act.act} className="border-t border-white/10 pt-20">
              {/* Act Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                <div className="lg:col-span-3">
                  <span className="text-xs font-mono tracking-widest text-white/40 block mb-1">
                    {act.act} // MONOGRAPH
                  </span>
                  <div className="w-8 h-[1px] bg-white/40" />
                </div>

                <div className="lg:col-span-5">
                  <h2 className="font-editorial text-3xl sm:text-5xl font-normal uppercase tracking-tight text-white">
                    {act.title}
                  </h2>
                  <span className="text-[11px] font-mono text-white/50 block mt-2">
                    {act.location}
                  </span>
                </div>

                <div className="lg:col-span-4">
                  <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>

              {/* Cinematic Full Width Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1A1A1A] group">
                <Image
                  src={act.image}
                  alt={act.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-104 filter brightness-90 contrast-[1.05]"
                />
              </div>

              {/* Featured Pieces in this Act */}
              {featuredGarmentObjs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-widest text-white/40">
                    Featured in this Plate:
                  </span>
                  <div className="flex flex-wrap items-center gap-6">
                    {featuredGarmentObjs.map((garment) => (
                      <Link
                        key={garment.id}
                        href={`/products/${garment.slug}`}
                        className="text-xs uppercase tracking-wider text-white hover:text-white/60 transition-colors flex items-center gap-1.5"
                      >
                        <span>{garment.name}</span>
                        <ArrowRight className="w-3 h-3 text-white/40" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Lookbook Closing CTA */}
      <section className="border-t border-white/10 py-24 text-center px-6">
        <span className="text-[11px] uppercase tracking-[0.3em] text-white/50 block mb-4">
          END OF MONOGRAPH
        </span>
        <h2 className="font-editorial text-4xl sm:text-5xl uppercase tracking-tight text-white">
          Experience The Pieces
        </h2>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F5F3EF] text-[#111111] text-xs uppercase tracking-widest font-medium hover:bg-white transition-colors"
          >
            <span>Shop The Lookbook Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
