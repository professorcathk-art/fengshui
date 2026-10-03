"use client";

import { motion } from "framer-motion";

export function PentagonMap() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-6 rounded-full border border-gold/20" />
      <div className="absolute inset-16 rounded-full border border-dashed border-gold/30" />
      <svg viewBox="0 0 200 200" className="relative h-full w-full">
        <motion.polygon
          points="100,18 176,72 148,164 52,164 24,72"
          fill="none"
          stroke="oklch(0.82 0.09 88)"
          strokeWidth="1.4"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
        <motion.polygon
          points="100,48 150,84 132,146 68,146 50,84"
          fill="oklch(0.82 0.09 88 / 0.08)"
          stroke="oklch(0.82 0.09 88 / 0.7)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />
        {[
          [100, 18],
          [176, 72],
          [148, 164],
          [52, 164],
          [24, 72],
        ].map(([x, y]) => (
          <motion.line
            key={`${x}-${y}`}
            x1="100"
            y1="100"
            x2={x}
            y2={y}
            stroke="oklch(0.82 0.09 88 / 0.45)"
            strokeWidth="0.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />
        ))}
        <circle cx="100" cy="100" r="3" fill="oklch(0.82 0.09 88)" />
      </svg>
      <motion.div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gold/70"
        animate={{ top: ["12%", "78%", "12%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
