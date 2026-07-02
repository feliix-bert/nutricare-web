"use client";

import { Shield, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Avatar } from "@/components/common/Avatar";

type AvatarVariant = "parent" | "medic";

type Props = {
  name: string;
  email: string;
  role: string;
  avatarSeed: string;
  avatarVariant?: AvatarVariant;
  statusLabel?: string;
};

export function ProfileHeroSection({
  name,
  email,
  role,
  avatarSeed,
  avatarVariant = "parent",
  statusLabel,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-outline-variant/10"
    >
      <div className="relative group">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-2 ring-outline-variant/20 overflow-hidden bg-primary-container/20">
          <Avatar
            seed={avatarSeed}
            variant={avatarVariant}
            size="xl"
            className="w-full h-full border-0"
          />
        </div>
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-secondary border-2 border-white shadow-sm" />
      </div>

      <div className="flex-1 text-center md:text-left pt-2">
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">{name}</h2>
        <p className="text-[15px] text-on-surface-variant mt-1">{email}</p>
        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
          <span className="inline-flex items-center gap-1.5 bg-surface-dim px-3 py-1.5 rounded-full border border-outline-variant/10">
            <Shield size={14} className="text-on-surface-variant" />
            <span className="text-xs font-semibold text-on-surface-variant capitalize">{role.toLowerCase()}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-surface-dim px-3 py-1.5 rounded-full border border-outline-variant/10">
            <TrendingUp size={14} className="text-on-surface-variant" />
            <span className="text-xs font-semibold text-on-surface-variant">{statusLabel ?? "Aktif"}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
