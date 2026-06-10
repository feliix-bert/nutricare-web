"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@/components/icons/home";
import { FileTextIcon } from "@/components/icons/file-text";
import { MessageCircleIcon } from "@/components/icons/message-circle";
import { ScanLineIcon } from "@/components/icons/scan-line";
import { UserIcon } from "@/components/icons/user";

const TABS = [
  { name: "Beranda", path: "/", Icon: HomeIcon },
  { name: "Log Gizi", path: "/nutrition", Icon: FileTextIcon },
  { name: "Tanya AI", path: "/consult", Icon: MessageCircleIcon },
  { name: "Scanner", path: "/scanner", Icon: ScanLineIcon },
  { name: "Profil", path: "/profile", Icon: UserIcon },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
      <div className="h-[4.5rem] bg-surface-lowest/95 backdrop-blur-md rounded-[1.75rem] shadow-[0_4px_24px_rgba(134,196,205,0.12)] border border-outline-variant/15 flex items-center justify-around px-1">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.path ||
            (tab.path !== "/" && pathname.startsWith(tab.path));
          const { Icon } = tab;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="flex flex-col items-center justify-center flex-1 gap-1 py-1"
            >
              <div
                className={`w-10 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "bg-tertiary-container text-tertiary-on-container" : "text-outline"
                }`}
              >
                <Icon size={20} />
              </div>
              <span
                className={`text-[10px] leading-none ${
                  isActive ? "font-bold text-secondary-on-container" : "font-medium text-outline"
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
