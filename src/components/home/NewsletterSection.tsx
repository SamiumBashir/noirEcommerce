"use client";

import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setEmail("");
      }, 4000);
    }
  };

  return (
    <section className="relative w-full py-32 md:py-44 bg-[#111111] text-[#F5F3EF] px-6 sm:px-12 md:px-16 overflow-hidden">
      {/* Subtle Background Animated Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-white to-neutral-400 blur-[130px] pointer-events-none"
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-[11px] uppercase tracking-[0.35em] font-medium text-white/50 block mb-4">
          COMMUNIQUÉ
        </span>

        <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal uppercase tracking-tight text-white">
          ENTER THE WORLD OF NOIR.
        </h2>

        <p className="mt-6 text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed font-light">
          Private invitations to limited garment capsules, seasonal runway releases, and confidential salon exhibitions.
        </p>

        {/* Minimalist Input Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-12 max-w-md mx-auto flex flex-col sm:flex-row items-center border-b border-white/30 focus-within:border-white transition-colors"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full py-4 px-2 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none tracking-wide text-center sm:text-left"
          />

          <button
            type="submit"
            className="w-full sm:w-auto shrink-0 py-4 px-6 text-xs uppercase tracking-[0.25em] font-medium text-white hover:text-white/70 transition-colors flex items-center justify-center gap-2"
          >
            {status === "success" ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>INVITED</span>
              </>
            ) : (
              <>
                <span>JOIN NOIR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <span className="block mt-4 text-[10px] text-white/40 uppercase tracking-widest">
          No spam. Only essential architectural announcements.
        </span>
      </div>
    </section>
  );
}
