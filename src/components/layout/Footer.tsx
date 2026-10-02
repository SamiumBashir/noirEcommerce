"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#111111] text-[#F5F3EF] pt-24 pb-12 px-6 sm:px-12 md:px-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-20 border-b border-white/10">
          {/* Brand Philosophy */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal tracking-tight uppercase">
              NOIR
            </h2>
            <p className="text-white/60 text-sm font-light max-w-sm leading-relaxed">
              Designed for those who move differently. Sculpted silhouettes, architectural tailoring, and uncompromising materiality for modern movement.
            </p>
            <div className="pt-2 text-xs uppercase tracking-widest text-white/40">
              Atelier Coordinates: 48.8566° N, 2.3522° E (Paris)
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-[11px] uppercase tracking-widest text-white/40 block font-medium">
              Collection
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider text-white/80">
              <li>
                <Link href="/shop?category=men" className="hover:text-white transition-colors">
                  Men&apos;s Atelier
                </Link>
              </li>
              <li>
                <Link href="/shop?category=women" className="hover:text-white transition-colors">
                  Women&apos;s Atelier
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-white transition-colors">
                  Leather & Eyewear
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="hover:text-white transition-colors">
                  The New Standard
                </Link>
              </li>
              <li>
                <Link href="/lookbook" className="hover:text-white transition-colors">
                  Visual Lookbook
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <span className="text-[11px] uppercase tracking-widest text-white/40 block font-medium">
              Client Service
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider text-white/80">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Account Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Private Wishlist
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Philosophy & Fabric
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Bespoke Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-[11px] uppercase tracking-widest text-white/40 block font-medium">
              Private Dispatch
            </span>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Receive private invitations to seasonal drops, lookbook releases, and archival pieces.
            </p>
            <form onSubmit={handleSubmit} className="relative pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-[#F5F3EF] text-[#111111] text-[11px] uppercase tracking-widest font-medium hover:bg-white transition-colors flex items-center justify-center gap-1.5"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <span>Request Membership</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Editorial Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 tracking-wider gap-4">
          <p>© {new Date().getFullYear()} NOIR ATELIER INC. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/about" className="hover:text-white transition-colors">
              Privacy Notice
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Carbon Transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
