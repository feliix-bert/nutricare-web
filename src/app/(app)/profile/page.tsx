"use client";

import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Mail, Shield, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  if (!user) {
    return (
      <PageShell title="Profil Saya">
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-outline">Memuat data profil...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Profil Saya" subtitle="Kelola akun dan preferensi">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 md:p-8 rounded-3xl shadow-none border border-outline-variant/15 flex flex-col items-center text-center">
          <Avatar seed={user.name} variant="parent" size="xl" className="mb-4" />
          <h2 className="text-xl font-bold text-on-surface">{user.name}</h2>
          <p className="text-outline text-sm mt-1">{user.email}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-secondary-container px-4 py-1.5 rounded-full">
            <Shield size={16} className="text-secondary" />
            <span className="text-sm font-semibold text-secondary capitalize">{user.role.toLowerCase()}</span>
          </div>
        </Card>

        <Card className="p-6 md:p-8 rounded-3xl shadow-none border border-outline-variant/15 flex flex-col gap-5">
          <h3 className="font-bold text-on-surface text-lg">Informasi Akun</h3>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-surface-low flex items-center justify-center flex-shrink-0">
              <Mail className="text-primary" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-outline">Email</p>
              <p className="font-semibold text-on-surface truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-surface-low flex items-center justify-center flex-shrink-0">
              <Wallet className="text-primary" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-outline">Wallet Address</p>
              <p className="font-semibold text-on-surface truncate">
                {user.walletAddress || "Belum terhubung"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 max-w-md">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Keluar
        </Button>
      </div>
    </PageShell>
  );
}
