"use client";

import { useAuthStore } from "@/stores/authStore";
import { Mail, Shield, Wallet, Settings, ChevronRight, LogOut, TrendingUp, Users, FileBadge, CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";

const STATS = [
  { label: "Pasien Aktif", value: "24", icon: Users },
  { label: "VC Diterbitkan", value: "15", icon: FileBadge },
  { label: "Konsultasi", value: "48", icon: TrendingUp },
];

const SETTINGS_ITEMS = [
  { icon: CalendarClock, label: "Jadwal Praktik", desc: "Atur jadwal ketersediaan Anda" },
  { icon: Wallet, label: "Pengaturan Wallet", desc: "Kelola dompet GiziChain Anda" },
  { icon: Settings, label: "Preferensi", desc: "Notifikasi & tampilan" },
  { icon: Shield, label: "Keamanan", desc: "Password & verifikasi dua langkah" },
];

export default function MedicProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  if (!user) {
    return (
      <PageShell title="Profil Medis">
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
    <PageShell title="Profil Tenaga Medis" subtitle="Kelola akun dan pengaturan instansi Anda">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        {/* ── Hero Profile Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-outline-variant/10"
        >
          <div className="relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-2 ring-outline-variant/20 overflow-hidden bg-primary-container/20">
              <Avatar seed={user.name} variant="medic" size="xl" className="w-full h-full border-0" />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-secondary border-2 border-white shadow-sm" />
          </div>
          <div className="flex-1 text-center md:text-left pt-2">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">{user.name}</h2>
            <p className="text-[15px] text-on-surface-variant mt-1">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 bg-surface-dim px-3 py-1.5 rounded-full border border-outline-variant/10">
                <Shield size={14} className="text-on-surface-variant" />
                <span className="text-xs font-semibold text-on-surface-variant capitalize">{user.role.toLowerCase()}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface-dim px-3 py-1.5 rounded-full border border-outline-variant/10">
                <TrendingUp size={14} className="text-on-surface-variant" />
                <span className="text-xs font-semibold text-on-surface-variant">Terverifikasi</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-3 gap-3 md:gap-4"
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 md:p-5 rounded-2xl bg-white border border-outline-variant/10 shadow-sm text-center flex flex-col items-center"
              >
                <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center mb-3">
                  <Icon size={16} className="text-on-surface-variant" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-on-surface mb-1">{stat.value}</p>
                <p className="text-[11px] md:text-xs text-on-surface-variant font-medium">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* ── Info + Settings Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-col"
          >
            <h3 className="font-bold text-on-surface-variant text-[13px] uppercase tracking-wider mb-3 px-1">Informasi Akun</h3>
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              {[
                { icon: Mail, label: "Email", value: user.email },
                { icon: Wallet, label: "Wallet Address", value: user.walletAddress || "Belum terhubung" },
              ].map((item, index, arr) => {
                const Icon = item.icon;
                const isLast = index === arr.length - 1;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 p-4 hover:bg-surface-low transition-colors ${!isLast ? "border-b border-outline-variant/10" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center flex-shrink-0">
                      <Icon className="text-on-surface-variant" size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-on-surface text-sm truncate">{item.value}</p>
                      <p className="text-[12px] text-on-surface-variant font-medium mt-0.5">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="flex flex-col"
          >
            <h3 className="font-bold text-on-surface-variant text-[13px] uppercase tracking-wider mb-3 px-1">Pengaturan Medis</h3>
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
              {SETTINGS_ITEMS.map((item, index, arr) => {
                const Icon = item.icon;
                const isLast = index === arr.length - 1;
                return (
                  <button
                    key={item.label}
                    className={`group flex items-center gap-4 p-4 hover:bg-surface-low transition-colors text-left ${!isLast ? "border-b border-outline-variant/10" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-[12px] text-on-surface-variant font-medium mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Logout ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex justify-center md:justify-start"
        >
          <button
            onClick={handleLogout}
            className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-danger-light/30 border border-danger/10 text-danger font-semibold hover:bg-danger hover:text-white hover:border-danger transition-all duration-300 shadow-sm w-full md:w-auto"
          >
            <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            Keluar dari Akun
          </button>
        </motion.div>
      </div>
    </PageShell>
  );
}
