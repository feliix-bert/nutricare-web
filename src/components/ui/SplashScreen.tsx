"use client";

import { motion } from "motion/react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(155deg, #faf8f5 0%, #f0ece4 35%, #e8f0ec 65%, #faf8f5 100%)" }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute -top-24 -left-20 w-72 h-72 rounded-full organic-blob opacity-60"
        style={{ background: "linear-gradient(135deg, rgba(45,138,126,0.08) 0%, rgba(58,163,148,0.04) 100%)" }}
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -right-16 w-80 h-80 organic-blob-alt opacity-50"
        style={{ background: "linear-gradient(135deg, rgba(107,158,107,0.06) 0%, rgba(212,164,84,0.04) 100%)" }}
        aria-hidden
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="rounded-[2rem] bg-white border border-white/60 shadow-elevated px-10 py-8">
          <BrandLogo variant="full" priority />
        </div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
