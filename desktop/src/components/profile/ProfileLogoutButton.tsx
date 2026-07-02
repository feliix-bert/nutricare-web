"use client";

import { LogOut } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  onLogout: () => void;
  delay?: number;
};

export function ProfileLogoutButton({ onLogout, delay = 0.4 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="mt-4 flex justify-center md:justify-start"
    >
      <button
        onClick={onLogout}
        className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-danger-light/30 border border-danger/10 text-danger font-semibold hover:bg-danger hover:text-white hover:border-danger transition-all duration-300 shadow-sm w-full md:w-auto"
      >
        <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
        Keluar dari Akun
      </button>
    </motion.div>
  );
}
