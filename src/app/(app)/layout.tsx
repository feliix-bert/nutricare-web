"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";
import { SideNavBar } from "@/components/navigation/SideNavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  // Fallback timeout to clear white screen if hydration completely fails
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isHydrated) {
      timeout = setTimeout(() => {
        console.warn("Layout hydration timeout, forcing redirect");
        router.replace("/auth/sign-in");
      }, 8000); // 8 seconds maximum wait
    }
    return () => clearTimeout(timeout);
  }, [isHydrated, router]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/auth/sign-in");
      return;
    }
    if (isHydrated && isAuthenticated && user) {
      const isMedic = user.role === "MEDIC";
      const onMedicRoute = pathname.startsWith("/medic");
      // PARENT accessing /medic → bounce to home
      if (!isMedic && onMedicRoute) {
        router.replace("/");
      }
      // MEDIC accessing non-medic routes → bounce to /medic
      if (isMedic && !onMedicRoute) {
        router.replace("/medic");
      }
    }
  }, [isHydrated, isAuthenticated, user, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-on-surface-variant animate-pulse">
            Menyiapkan sesi...
          </p>
        </div>
      </div>
    );
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
          !shouldHideNav ? "md:ml-[272px]" : ""
        }`}
      >
        <div className="min-h-screen pb-24 md:pb-0">{children}</div>
      </main>

      {!shouldHideNav && <BottomTabBar />}
    </div>
  );
}
