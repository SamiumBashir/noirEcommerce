"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  duration = 1.1,
  direction = "up",
  className = "",
}: RevealProps) {
  const getClipPathVariants = () => {
    switch (direction) {
      case "up":
        return {
          initial: { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", y: 40 },
          animate: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", y: 0 },
        };
      case "down":
        return {
          initial: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", y: -40 },
          animate: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", y: 0 },
        };
      case "left":
        return {
          initial: { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)", x: 40 },
          animate: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", x: 0 },
        };
      case "right":
        return {
          initial: { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", x: -40 },
          animate: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", x: 0 },
        };
    }
  };

  const variants = getClipPathVariants();

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={variants.initial}
        whileInView={variants.animate}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          duration,
          delay,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
