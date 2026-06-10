"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";
import { SideNavBar } from "@/components/navigation/SideNavBar";
import { SplashScreen } from "@/components/ui/SplashScreen";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      useAuthStore.getState().hydrate();
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/auth/sign-in");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return <SplashScreen />;
  }

  const shouldHideNav =
    pathname === "/scanner" ||
    pathname.includes("/scanner/analysis") ||
    pathname.includes("/assessment");

  return (
    <div className="flex min-h-screen bg-background">
      {!shouldHideNav && <SideNavBar />}

      <main
        className={`flex-1 min-h-screen w-full transition-all duration-300 ${
          !shouldHideNav ? "md:ml-64" : ""
        }`}
      >
        <div className="min-h-screen pb-24 md:pb-0">{children}</div>
      </main>

      {!shouldHideNav && <BottomTabBar />}
    </div>
  );
}
