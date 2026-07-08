import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/utils/supabase";
import type { User } from "@/features/auth/types/auth-types";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const RootNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setUser(profile as unknown as User);
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
