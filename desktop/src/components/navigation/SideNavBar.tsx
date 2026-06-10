"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/common/Avatar";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HomeIcon } from "@/components/icons/home";
import { FileTextIcon } from "@/components/icons/file-text";
import { ScanLineIcon } from "@/components/icons/scan-line";
import { MessageCircleIcon } from "@/components/icons/message-circle";
import { UserIcon } from "@/components/icons/user";

type NavRoute = {
  name: string;
  href: string;
  Icon: React.FC<{ size?: number; className?: string }>;
};

const routes: NavRoute[] = [
  { name: "Beranda", href: "/", Icon: HomeIcon },
  { name: "Log Gizi", href: "/nutrition", Icon: FileTextIcon },
  { name: "Scanner", href: "/scanner", Icon: ScanLineIcon },
  { name: "Tanya AI", href: "/consult", Icon: MessageCircleIcon },
  { name: "Profil", href: "/profile", Icon: UserIcon },
];

export function SideNavBar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 bg-surface-lowest border-r border-outline-variant/20 fixed inset-y-0 left-0 z-40">
      <div className="flex flex-col h-full px-5 py-8">
        <div className="mb-10 flex items-center">
          <BrandLogo size="sidebar" href="/" priority />
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {routes.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/" && pathname.startsWith(route.href));
            const { Icon } = route;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-secondary-container shadow-sm"
                    : "hover:bg-surface-low"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-white/70 text-secondary-on-container" : "text-outline group-hover:text-primary"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-secondary-on-container" : "text-on-surface-variant group-hover:text-on-surface"
                  }`}
                >
                  {route.name}
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/profile"
          className="mt-auto flex items-center gap-3 p-3 rounded-2xl bg-surface-low hover:bg-surface-dim transition-colors border border-outline-variant/10"
        >
          <Avatar seed="Ibu Ani" variant="parent" size="md" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">Ibu Ani</p>
            <p className="text-xs text-outline truncate">Orang Tua Aktif</p>
          </div>
        </Link>
      </div>
    </nav>
  );
}
