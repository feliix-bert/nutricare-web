"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Avatar } from "@/components/common/Avatar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HomeIcon } from "@/components/icons/home";
import { FileTextIcon } from "@/components/icons/file-text";
import { ScanLineIcon } from "@/components/icons/scan-line";
import { MessageCircleIcon } from "@/components/icons/message-circle";
import { UserIcon } from "@/components/icons/user";
import { Bell, Users } from "lucide-react";

import { useAuthStore } from "@/stores/authStore";
import { LogoutConfirmModal } from "@/components/common/LogoutConfirmModal";

type NavRoute = {
  name: string;
  href: string;
  Icon: React.FC<{ size?: number; className?: string }>;
};

const PARENT_ROUTES: NavRoute[] = [
  { name: "Beranda", href: "/", Icon: HomeIcon },
  { name: "Nutrisi", href: "/nutrition", Icon: FileTextIcon },
  { name: "Scanner", href: "/scanner", Icon: ScanLineIcon },
  { name: "Tanya AI", href: "/consult", Icon: MessageCircleIcon },
  { name: "Profil", href: "/profile", Icon: UserIcon },
];

const MEDIC_ROUTES: NavRoute[] = [
  { name: "Dashboard", href: "/medic", Icon: HomeIcon },
  { name: "Pasien", href: "/medic/patients", Icon: Users as React.FC<{ size?: number; className?: string }> },
  { name: "Konsultasi", href: "/medic/consultations", Icon: MessageCircleIcon },
  { name: "Peringatan", href: "/medic/alerts", Icon: Bell as React.FC<{ size?: number; className?: string }> },
  { name: "Profil", href: "/medic/profile", Icon: UserIcon },
];

export function SideNavBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isMedic = user?.role === "MEDIC";
  const routes = isMedic ? MEDIC_ROUTES : PARENT_ROUTES;
  
  const userName = user?.name || "User";
  const userLabel = isMedic ? "Tenaga Medis" : "Orang Tua Aktif";
  // The backend doesn't explicitly store gender for the parent/medic, we just use their name as seed
  const avatarVariant = isMedic ? "medic" : "parent";

  return (
    <>
      <nav
        className={`hidden md:flex flex-col w-[272px] fixed inset-y-0 left-0 z-40 border-r border-outline-variant/10 ${
          isMedic
            ? "bg-gradient-to-b from-[var(--color-medic-bg-gradient-start)] to-[var(--color-medic-bg-gradient-end)]"
            : "gradient-sidebar"
        }`}
      >
        <div className="flex flex-col h-full px-5 py-8">
          {/* Brand */}
          <div className="mb-6 px-1">
            <BrandLogo variant="full" href={isMedic ? "/medic" : "/"} priority showText />
          </div>

          {/* Medic Indicator (Only for medics) */}
          {isMedic && (
            <div className="mb-8 px-2">
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)]">
                {/* Decorative shapes inside the card */}
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 rounded-full bg-white/20 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-12 h-12 rounded-full bg-black/10 blur-lg"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Sistem</p>
                    <p className="text-sm font-extrabold text-white">Klinik Dokter</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav Label */}
          <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>

          {/* Nav Items */}
          <div className="flex flex-col gap-1 flex-1">
            {routes.map((route) => {
              const isActive =
                pathname === route.href ||
                (route.href !== "/" && route.href !== "/medic" && pathname.startsWith(route.href));
              const { Icon } = route;

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className="relative group"
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-primary-container/60 shadow-sm"
                        : "hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full gradient-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-out ${
                        isActive
                          ? "bg-primary text-white shadow-[0_4px_14px_rgba(45,138,126,0.35)]"
                          : "bg-surface-warm text-on-surface-variant group-hover:bg-primary-container/30 group-hover:text-primary"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={`text-sm transition-all duration-300 ease-out ${
                        isActive
                          ? "text-primary font-bold"
                          : "text-on-surface-variant font-semibold group-hover:text-on-surface group-hover:font-bold"
                      }`}
                    >
                      {route.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/10 my-4 mx-2" />

          {/* Profile Card & Logout */}
          <div className="flex items-center gap-2">
            <Link
              href={isMedic ? "/medic/profile" : "/profile"}
              className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-surface-warm hover:shadow-card transition-all duration-300 hover-lift border border-outline-variant/8"
            >
              <Avatar seed={userName} variant={avatarVariant} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-on-surface truncate">{userName}</p>
                <p className="text-xs text-on-surface-variant truncate">{userLabel}</p>
              </div>
            </Link>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              aria-label="Logout"
              className="p-3 rounded-2xl bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all duration-300 hover-lift border border-danger/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Modal */}
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
    </>
  );
}
