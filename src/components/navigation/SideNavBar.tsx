"use client";

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

import { useAuthStore } from "@/stores/authStore";

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
  { name: "Profil", href: "/medic/profile", Icon: UserIcon },
];

export function SideNavBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const isMedic = user?.role === "MEDIC";
  const routes = isMedic ? MEDIC_ROUTES : PARENT_ROUTES;
  
  const userName = user?.name || "User";
  const userLabel = isMedic ? "Tenaga Medis" : "Orang Tua Aktif";
  // The backend doesn't explicitly store gender for the parent/medic, we just use their name as seed
  const avatarVariant = isMedic ? "medic" : "parent";

  return (
    <nav className="hidden md:flex flex-col w-[272px] gradient-sidebar fixed inset-y-0 left-0 z-40 border-r border-outline-variant/10">
      <div className="flex flex-col h-full px-5 py-8">
        {/* Brand */}
        <div className="mb-8 px-1">
          <BrandLogo variant="full" href={isMedic ? "/medic" : "/"} priority showText />
        </div>

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
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = "/auth/sign-in";
            }}
            aria-label="Logout"
            className="p-3 rounded-2xl bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all duration-300 hover-lift border border-danger/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
