"use client";

import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Mail, Shield, Wallet, Settings, ChevronRight, Baby, LogOut, TrendingUp, ClipboardList, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

const STATS = [
  { label: "Anak Terdaftar", value: "2", icon: Baby, color: "text-primary", bg: "bg-primary-container/50" },
  { label: "Assessment", value: "12", icon: ClipboardList, color: "text-secondary-on-container", bg: "bg-secondary-container/50" },
  { label: "Status Aktif", value: "Optimal", icon: TrendingUp, color: "text-tertiary-on-container", bg: "bg-tertiary-container/50" },
];

const SETTINGS_ITEMS = [
  { icon: Baby, label: "Data Anak", desc: "Kelola profil anak Anda", color: "text-primary", bg: "bg-primary-container/40" },
  { icon: Settings, label: "Preferensi", desc: "Notifikasi & tampilan", color: "text-secondary-on-container", bg: "bg-secondary-container/40" },
  { icon: Shield, label: "Keamanan", desc: "Password & verifikasi", color: "text-tertiary-on-container", bg: "bg-tertiary-container/40" },
  { icon: Star, label: "Langganan", desc: "Kelola paket premium", color: "text-accent", bg: "bg-accent-light/40" },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  if (!user) {
    return (
      <PageShell title="Profil">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-on-surface-variant font-medium">Memuat data profil...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Profil" subtitle="Kelola akun dan preferensi Anda">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* ── Hero Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-[2rem] overflow-hidden shadow-card">
            {/* Cover */}
            <div
              className="h-32 md:h-44 relative"
              style={{ background: "linear-gradient(135deg, #2d8a7e 0%, #3aa394 40%, #6b9e6b 70%, #d4a454 100%)" }}
            >
              <div className="absolute inset-0">
                <div className="absolute top-5 right-10 w-24 h-24 rounded-full bg-white/10 organic-blob" aria-hidden />
                <div className="absolute bottom-0 left-16 w-32 h-32 rounded-full bg-white/8 organic-blob-alt" aria-hidden />
                <div className="absolute top-3 left-4 w-12 h-12 rounded-full bg-white/8" aria-hidden />
              </div>
            </div>

            {/* Profile content */}
            <div className="bg-white px-6 md:px-8 pb-6 md:pb-7 -mt-14 relative">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-elevated overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    <Avatar seed={user.name} variant="parent" size="xl" className="w-full h-full border-0" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-secondary border-[3px] border-white" />
                </div>
                <div className="flex-1 pb-1 sm:pb-3">
                  <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">{user.name}</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-0.5">{user.email}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary-container/40 px-3 py-1 rounded-full">
                      <Shield size={12} className="text-primary" />
                      <span className="text-xs font-bold text-primary capitalize">{user.role.toLowerCase()}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-secondary-container/40 px-3 py-1 rounded-full">
                      <TrendingUp size={12} className="text-secondary-on-container" />
                      <span className="text-xs font-bold text-secondary-on-container">Aktif</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-3 gap-4"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="group p-4 rounded-2xl bg-white border border-outline-variant/8 shadow-card text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={16} className={stat.color} />
                </div>
                <p className={`text-xl font-extrabold ${stat.color} mb-0.5`}>{stat.value}</p>
                <p className="text-xs text-on-surface-variant font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Info + Settings Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="font-bold text-on-surface text-base tracking-tight mb-4">Informasi Akun</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Mail, label: "Email", value: user.email, color: "text-primary", bg: "bg-primary-container/40" },
                  { icon: Wallet, label: "Wallet Address", value: user.walletAddress || "Belum terhubung", color: "text-tertiary-on-container", bg: "bg-tertiary-container/40" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-warm border border-outline-variant/8 hover:bg-white hover:shadow-card transition-all duration-300"
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={item.color} size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">{item.label}</p>
                        <p className="font-semibold text-on-surface text-sm truncate mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="font-bold text-on-surface text-base tracking-tight mb-4">Pengaturan</h3>
              <div className="flex flex-col gap-2">
                {SETTINGS_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center gap-3.5 p-3 rounded-xl bg-surface-warm border border-outline-variant/8 hover:bg-white hover:shadow-card transition-all duration-300 text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon size={16} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors duration-200">{item.label}</p>
                        <p className="text-xs text-on-surface-variant">{item.desc}</p>
                      </div>
                      <ChevronRight size={15} className="text-on-surface-variant/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Logout ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleLogout}
            className="group w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-danger/20 bg-danger-light text-danger font-bold hover:bg-danger hover:text-white hover:border-danger hover:shadow-[0_4px_20px_rgba(216,85,85,0.25)] transition-all duration-300"
          >
            <LogOut size={16} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Keluar dari Akun
          </button>
        </motion.div>
      </div>
    </PageShell>
  );
}
