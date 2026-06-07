import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
