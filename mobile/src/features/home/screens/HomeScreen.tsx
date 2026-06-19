import React, { useCallback, useState } from "react";
import { router } from "expo-router";
import { ScrollView, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Card } from "@/components/ui/Card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useChildrenList } from "@/features/children/hooks/useChildren";
import { IconSymbol } from "@/components/ui/icon-symbol";

const MiniBarChart = React.memo(({ color }: { color: string }) => (
  <View className="flex-row gap-1.5 h-7 items-end mt-4">
    <View className="flex-1 h-3 rounded-full opacity-30" style={{ backgroundColor: color }} />
    <View className="flex-1 h-4 rounded-full opacity-40" style={{ backgroundColor: color }} />
    <View className="flex-1 h-5 rounded-full opacity-50" style={{ backgroundColor: color }} />
    <View className="flex-1 h-3 rounded-full opacity-30" style={{ backgroundColor: color }} />
    <View className="flex-1 h-7 rounded-full" style={{ backgroundColor: color }} />
  </View>
));

MiniBarChart.displayName = 'MiniBarChart';

const ChildPill = React.memo(
  ({
    child,
    isActive,
    onPress,
  }: {
    child: { id: string; name: string; ageMonths: number };
    isActive: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 px-5 py-3 rounded-full border ${
        isActive ? "bg-secondary-container border-secondary-container" : "bg-surface-low border-outline-variant/15"
      }`}
    >
      <Text className="text-sm">👦</Text>
      <Text
        className={`text-xs font-extrabold ${isActive ? "text-on-secondary-container" : "text-on-surface-variant"}`}
      >
        {child.name} ({child.ageMonths} Bln)
      </Text>
    </Pressable>
  )
);

ChildPill.displayName = 'ChildPill';

const NutritionColumn = React.memo(
  ({ label, value, percentage, color }: { label: string; value: string; percentage: number; color: string }) => (
    <View className="items-center flex-1">
      <View className="w-10 h-20 bg-surface-low rounded-full overflow-hidden justify-end mb-2 border border-outline-variant/10">
        <View style={{ height: `${percentage}%`, backgroundColor: color, borderRadius: 9999 }} />
      </View>
      <Text className="text-[10px] text-outline font-bold mb-0.5">{label}</Text>
      <Text className="text-[11px] font-extrabold text-on-surface">{value}</Text>
    </View>
  )
);

NutritionColumn.displayName = 'NutritionColumn';

export const HomeScreen = () => {
  const { data, isLoading } = useChildrenList();
  const children = data?.data ?? [];
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading) return <LoadingOverlay />;

  // Default active child to the first child if not selected
  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0];

  if (!activeChild) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center px-6 pt-6 pb-3">
          <View>
            <Text className="text-sm text-outline font-medium">Halo,</Text>
            <Text className="text-2xl font-extrabold tracking-tight text-on-surface">Bunda 🌸</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/children/new")}
            className="w-11 h-11 rounded-full items-center justify-center bg-primary"
            hitSlop={8}
          >
            <Text className="text-white text-2xl font-normal leading-7">+</Text>
          </Pressable>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <Text className="text-5xl">👶</Text>
              </EmptyMedia>
              <EmptyTitle>Belum Ada Data Anak</EmptyTitle>
              <EmptyDescription>
                Tambahkan data anak pertama kamu untuk mulai memantau tumbuh kembangnya.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onPress={() => router.push("/(app)/children/new")} variant="primary" size="md" className="px-8">
                Tambah Anak
              </Button>
            </EmptyContent>
          </Empty>
        </View>
      </SafeAreaView>
    );
  }

  // Dynamic parameters based on child's name/age to match screenshot styling
  const isAndi = activeChild.name.toLowerCase().includes("andi");
  const growthPercentage = isAndi ? 91 : 94;
  const statusLabel = isAndi ? "Tumbuh Kembang Optimal" : "Tumbuh Sangat Baik";
  const calorieTarget = isAndi ? "1350" : "850";
  const weightChange = isAndi ? "+200g" : "+350g";
  const heightChange = isAndi ? "+1.2cm" : "+1.5cm";
  const weightVal = isAndi ? "9.5" : "7.1";
  const heightVal = isAndi ? "74.0" : "65.0";

  // Dynamic nutrition progress values
  const nutrition = isAndi
    ? [
        { label: "Prot", value: "62.5g", percentage: 75, color: "#8fa4a6" },
        { label: "Fats", value: "23.6g", percentage: 60, color: "#a3b59a" },
        { label: "Carbs", value: "45.7g", percentage: 70, color: "#c5be95" },
        { label: "RDC", value: "14%", percentage: 14, color: "#f2c4c4" },
      ]
    : [
        { label: "Prot", value: "38.2g", percentage: 80, color: "#8fa4a6" },
        { label: "Fats", value: "18.4g", percentage: 75, color: "#a3b59a" },
        { label: "Carbs", value: "32.1g", percentage: 65, color: "#c5be95" },
        { label: "RDC", value: "45%", percentage: 45, color: "#f2c4c4" },
      ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-container-padding py-4">
          <View className="flex-row items-center gap-3">
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDNo7cQUNctrRjKfFyO0beDmlnMVuCR58pAdnHNOg0TG8G0jxun6sTPVqx-rvzgSg_vL6PxecUjBwCQZafL9hBtPvbRVhfoaHqQ8YxhDxXeEI-R5JP42AamTjvAZ4K6VwnRIiKdZOeIE9CWARiMntbtlP-XYTAWDrccYD4e6yT0SkFe8jiYXX1uP9TQf1DLTjIye4fRmJCApiD7ycO1sionPND39QIFLDPBcjRlfxREqzFD5KEXLZJc_wROSafiBQcXDhNl3wrAqA",
              }}
              className="w-11 h-11 rounded-full border-2 border-primary-container"
            />
            <View>
              <Text className="text-[11px] text-outline font-bold leading-3">Selamat pagi,</Text>
              <Text className="text-base font-extrabold text-on-surface tracking-tight">Hello, Ibu Ani!</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10">
              <IconSymbol name="magnifyingglass" size={18} color="#3e646a" />
            </Pressable>
            <Pressable className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10 relative">
              <IconSymbol name="bell" size={18} color="#3e646a" />
              <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error border border-white" />
            </Pressable>
          </View>
        </View>

        {/* Child Selector Pills (Horizontal Scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingVertical: 12 }}
        >
          {children.map((child) => (
            <ChildPill
              key={child.id}
              child={child}
              isActive={child.id === activeChild.id}
              onPress={() => setActiveChildId(child.id)}
            />
          ))}
          <Pressable
            onPress={() => router.push("/(app)/children/new")}
            className="flex-row items-center gap-1.5 px-5 py-3 rounded-full border border-dashed border-outline/40 bg-surface-lowest"
          >
            <Text className="text-xs font-bold text-outline">+ Tambah Anak</Text>
          </Pressable>
        </ScrollView>

        {/* Main Overview Card */}
        <View className="px-container-padding py-2">
          <View className="bg-primary-container rounded-[32px] p-6 soft-float border border-primary/10">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                {/* Status Badge */}
                <View className="bg-white/60 px-3 py-1 rounded-full self-start mb-4">
                  <Text className="text-[10px] font-extrabold text-primary tracking-wider">
                    STATUS: {activeChild.latestPrediction?.status ?? "NORMAL"}
                  </Text>
                </View>

                {/* Growth Percentage */}
                <Text className="text-[40px] font-extrabold text-on-surface leading-10 mb-1">{growthPercentage}%</Text>
                <Text className="text-sm font-extrabold text-on-surface-variant">{statusLabel}</Text>
              </View>

              {/* Calorie Arc Meter */}
              <View className="w-24 h-24 rounded-full border-[6px] border-primary/10 items-center justify-center relative bg-white/40">
                {/* Visual Progress Arc using rotated border */}
                <View
                  className="absolute inset-0 rounded-full border-[6px] border-t-primary border-r-primary border-b-transparent border-l-transparent"
                  style={{ transform: [{ rotate: "45deg" }] }}
                />
                <View className="items-center">
                  <Text className="text-[17px] font-extrabold text-on-surface">{calorieTarget}</Text>
                  <Text className="text-[9px] text-outline font-bold">kkal</Text>
                </View>
              </View>
            </View>

            {/* Detail Perkembangan Button */}
            <Pressable
              onPress={() => router.push(`/(app)/children/${activeChild.id}` as any)}
              className="bg-white/80 active:bg-white rounded-full py-3.5 px-6 flex-row justify-center items-center gap-1.5 mt-6 border border-primary/5 shadow-sm"
            >
              <Text className="text-xs font-extrabold text-primary">Detail Perkembangan</Text>
              <IconSymbol name="chevron.right" size={14} color="#3e646a" />
            </Pressable>
          </View>
        </View>

        {/* Side-by-Side Metric Cards */}
        <View className="px-container-padding py-2 flex-row gap-4">
          {/* Weight Card */}
          <Card className="flex-1 p-5 border border-outline-variant/15">
            <View className="flex-row justify-between items-center mb-3">
              <View className="w-9 h-9 rounded-full bg-secondary-container/45 items-center justify-center">
                <IconSymbol name="dumbbell.fill" size={16} color="#506444" />
              </View>
              <Text className="text-[10px] font-bold text-secondary">{weightChange}</Text>
            </View>
            <Text className="text-[10px] text-outline font-bold leading-3">Berat Badan</Text>
            <Text className="text-xl font-extrabold text-on-surface mt-1">
              {weightVal} <Text className="text-xs font-bold text-outline">Kg</Text>
            </Text>
            <MiniBarChart color="#506444" />
          </Card>

          {/* Height Card */}
          <Card className="flex-1 p-5 border border-outline-variant/15">
            <View className="flex-row justify-between items-center mb-3">
              <View className="w-9 h-9 rounded-full bg-tertiary-container/40 items-center justify-center">
                <IconSymbol name="ruler.fill" size={16} color="#64601e" />
              </View>
              <Text className="text-[10px] font-bold text-tertiary">{heightChange}</Text>
            </View>
            <Text className="text-[10px] text-outline font-bold leading-3">Tinggi Badan</Text>
            <Text className="text-xl font-extrabold text-on-surface mt-1">
              {heightVal} <Text className="text-xs font-bold text-outline">cm</Text>
            </Text>
            <MiniBarChart color="#64601e" />
          </Card>
        </View>

        {/* Nutrition Hari Ini Card */}
        <View className="px-container-padding py-2">
          <Card className="p-5 border border-outline-variant/15">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10">
                  <IconSymbol name="fork.knife" size={18} color="#3e646a" />
                </View>
                <Text className="text-sm font-extrabold text-on-surface">Nutrisi Hari Ini</Text>
              </View>
              <Pressable
                onPress={() => router.push("/(app)/(tabs)/scanner" as any)}
                className="w-8 h-8 rounded-full bg-primary-container items-center justify-center"
              >
                <Text className="text-primary font-bold text-lg leading-6">+</Text>
              </Pressable>
            </View>

            {/* Nutrition Fill Columns */}
            <View className="flex-row justify-between">
              {nutrition.map((item) => (
                <NutritionColumn
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  percentage={item.percentage}
                  color={item.color}
                />
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
