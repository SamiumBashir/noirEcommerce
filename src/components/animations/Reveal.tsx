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
  duration = 0.85,
  direction = "up",
  className = "",
}: RevealProps) {
  const getVariants = () => {
    switch (direction) {
      case "up":
        return {
          initial: { opacity: 0, y: 35 },
          animate: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          initial: { opacity: 0, y: -35 },
          animate: { opacity: 1, y: 0 },
        };
      case "left":
        return {
          initial: { opacity: 0, x: -35 },
          animate: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          initial: { opacity: 0, x: 35 },
          animate: { opacity: 1, x: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={variants.initial}
        whileInView={variants.animate}
        viewport={{ once: true, amount: 0.05 }}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
