"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function LogoutConfirmModal({ isOpen, onClose }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      router.replace("/auth/sign-in");
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={!isLoggingOut ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
              className="w-full max-w-sm bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 pointer-events-auto relative overflow-hidden"
            >
              {/* Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600" />

              {!isLoggingOut && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              )}

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-5 border border-rose-100 shadow-inner">
                  {isLoggingOut ? (
                    <Loader2 size={28} className="text-rose-500 animate-spin" />
                  ) : (
                    <LogOut size={28} className="text-rose-500 ml-1" />
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  {isLoggingOut ? "Sedang Keluar..." : "Logout dari NutriCare?"}
                </h3>

                <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-8 px-2">
                  {isLoggingOut
                    ? "Mohon tunggu, sedang memproses logout..."
                    : "Anda akan keluar dari sesi saat ini. Login kembali untuk mengakses data Anda."}
                </p>

                {!isLoggingOut && (
                  <div className="flex w-full gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      Ya, Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
