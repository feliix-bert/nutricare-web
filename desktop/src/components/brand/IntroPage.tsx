"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { UtensilsIcon } from "@/components/icons/utensils";
import { HomeIcon } from "@/components/icons/home";
import { MessageCircleIcon } from "@/components/icons/message-circle";

const FEATURES = [
  { label: "MPASI & Gizi", Icon: UtensilsIcon },
  { label: "Tumbuh Kembang", Icon: HomeIcon },
  { label: "Konsultasi AI", Icon: MessageCircleIcon },
] as const;

const INTRO_DURATION_MS = 2800;

type IntroPageProps = {
  onComplete?: () => void;
  /** Shorter variant for auth hydration splash */
  variant?: "full" | "minimal";
  /** When false, stays visible until parent unmounts (hydration splash) */
  autoDismiss?: boolean;
};

export function IntroPage({
  onComplete,
  variant = "full",
  autoDismiss = true,
}: IntroPageProps) {
  const [progress, setProgress] = useState(0);

  const finish = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = autoDismiss
        ? Math.min(100, (elapsed / INTRO_DURATION_MS) * 100)
        : ((elapsed % INTRO_DURATION_MS) / INTRO_DURATION_MS) * 100;
      setProgress(pct);
      if (autoDismiss && elapsed >= INTRO_DURATION_MS) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [finish, autoDismiss]);

  const isMinimal = variant === "minimal";

  return (
    <motion.div
      role="dialog"
      aria-label="Selamat datang di GiziChain"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background cursor-pointer"
      onClick={autoDismiss ? finish : undefined}
      onKeyDown={autoDismiss ? (e) => e.key === "Enter" && finish() : undefined}
      tabIndex={autoDismiss ? 0 : -1}
    >
      {/* Ambient pastel orbs — Wellspace / Wellnest style */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 12, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-20 -right-12 h-72 w-72 rounded-full bg-secondary/25 blur-3xl"
        animate={{ x: [0, -14, 0], y: [0, -10, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-tertiary/20 blur-2xl"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 max-w-sm w-full">
        {/* Logo card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-[2rem] bg-surface-lowest/90 backdrop-blur-sm border border-white/80 shadow-[0_8px_40px_rgba(134,196,205,0.18)] px-8 py-7 sm:px-10 sm:py-8"
          >
            <BrandLogo size="hero" priority align="center" className="mx-auto" />
          </motion.div>

          {/* Twinkle accent */}
          <motion.span
            aria-hidden
            className="absolute -top-1 -right-1 text-lg"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85], rotate: [0, 15, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.span>
        </motion.div>

        {!isMinimal && (
          <>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
              className="mt-8 text-center text-base sm:text-lg font-semibold text-on-surface-variant leading-relaxed"
            >
              Pantau tumbuh kembang &amp; gizi MPASI
              <span className="block text-primary font-bold mt-0.5">dengan bantuan AI</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {FEATURES.map(({ label, Icon }, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + i * 0.12, duration: 0.5 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-lowest/80 border border-outline-variant/15 text-xs sm:text-sm font-semibold text-on-surface-variant shadow-sm"
                >
                  <Icon size={15} className="text-primary" />
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </>
        )}

        {isMinimal && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-sm font-medium text-outline"
          >
            Memuat...
          </motion.p>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 inset-x-0 px-8 pb-8 sm:pb-10 z-10">
        <div className="mx-auto max-w-xs">
          <div className="h-1 rounded-full bg-outline-variant/25 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          {!isMinimal && autoDismiss && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.2 }}
              className="text-center text-[11px] text-outline mt-3 font-medium"
            >
              Ketuk untuk lanjut
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

type IntroOverlayProps = {
  show: boolean;
  onComplete?: () => void;
  variant?: "full" | "minimal";
};

export function IntroOverlay({ show, onComplete, variant = "full" }: IntroOverlayProps) {
  return (
    <AnimatePresence>
      {show && <IntroPage key="intro" onComplete={onComplete} variant={variant} />}
    </AnimatePresence>
  );
}
