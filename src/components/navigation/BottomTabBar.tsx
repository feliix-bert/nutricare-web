"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HomeIcon } from "@/components/icons/home";
import { FileTextIcon } from "@/components/icons/file-text";
import { MessageCircleIcon } from "@/components/icons/message-circle";
import { ScanLineIcon } from "@/components/icons/scan-line";
import { UserIcon } from "@/components/icons/user";

const TABS = [
  { name: "Beranda", path: "/", Icon: HomeIcon },
  { name: "Nutrisi", path: "/nutrition", Icon: FileTextIcon },
  { name: "Tanya AI", path: "/consult", Icon: MessageCircleIcon },
  { name: "Scanner", path: "/scanner", Icon: ScanLineIcon },
  { name: "Profil", path: "/profile", Icon: UserIcon },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
      <div className="h-[4.5rem] bg-white rounded-[1.75rem] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.path ||
            (tab.path !== "/" && pathname.startsWith(tab.path));
          const { Icon } = tab;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="relative flex flex-col items-center justify-center flex-1 gap-1 py-1"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottom-tab-active"
                    className="absolute inset-0 -m-1.5 rounded-xl bg-primary-container/50"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
                <div
                  className={`relative w-10 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-on-surface-variant/60"
                  }`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <span
                className={`text-[10px] leading-none transition-colors duration-200 ${
                  isActive
                    ? "font-bold text-primary"
                    : "font-medium text-on-surface-variant/60"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
