"use client";

import { useAuthStore } from "@/stores/authStore";
import { Mail, Wallet, Baby, Settings, Shield, Star, TrendingUp, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileHeroSection } from "@/components/profile/ProfileHeroSection";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { ProfileSettingsList } from "@/components/profile/ProfileSettingsList";
import { ProfileLogoutButton } from "@/components/profile/ProfileLogoutButton";

const STATS = [
  { label: "Anak Terdaftar", value: "2", icon: Baby },
  { label: "Assessment", value: "12", icon: ClipboardList },
  { label: "Status Aktif", value: "Optimal", icon: TrendingUp },
];

const SETTINGS_ITEMS = [
  { icon: Baby, label: "Data Anak", desc: "Kelola profil anak Anda" },
  { icon: Settings, label: "Preferensi", desc: "Notifikasi & tampilan" },
  { icon: Shield, label: "Keamanan", desc: "Password & verifikasi" },
  { icon: Star, label: "Langganan", desc: "Kelola paket premium" },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
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
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        <ProfileHeroSection
          name={user.name}
          email={user.email}
          role={user.role}
          avatarSeed={user.name}
          avatarVariant="parent"
        />

        <ProfileStatsGrid stats={STATS} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoCard
            title="Informasi Akun"
            items={[
              { icon: Mail, label: "Email", value: user.email },
              { icon: Wallet, label: "Wallet Address", value: user.walletAddress || "Belum terhubung" },
            ]}
          />
          <ProfileSettingsList title="Pengaturan" items={SETTINGS_ITEMS} />
        </div>

        <ProfileLogoutButton onLogout={handleLogout} />
      </div>
    </PageShell>
  );
}
