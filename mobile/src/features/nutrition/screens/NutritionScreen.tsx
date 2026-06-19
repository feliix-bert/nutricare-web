import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Card, CardContent } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useNutritionStore, NutritionLog } from "@/stores/nutritionStore";
import { formatTime } from "@/utils/format";

type SuggestionItem = {
  id: string;
  name: string;
  ageRange: string;
  description: string;
  imageUrl: string;
};

const deleteIconStyle = { transform: [{ rotate: "45deg" }] };

const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "sug_1",
    name: "Bubur Salmon Labu",
    ageRange: "6-8 Bulan",
    description: "Kaya Omega-3 & Vitamin A",
    imageUrl: "https://images.unsplash.com/photo-1547058886-f685c2c77d5b?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: "sug_2",
    name: "Nasi Tim Ayam Brokoli",
    ageRange: "9-12 Bulan",
    description: "Tekstur cincang halus",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=240&auto=format&fit=crop",
  },
  {
    id: "sug_3",
    name: "Puree Alpukat Halus",
    ageRange: "6 Bulan",
    description: "Lemak sehat untuk otak",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=240&auto=format&fit=crop",
  },
];

export const NutritionScreen = () => {
  const logs = useNutritionStore((s) => s.logs);
  const removeLog = useNutritionStore((s) => s.removeLog);

  const totalCalories = logs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = Math.round(logs.reduce((acc, curr) => acc + curr.protein, 0) * 10) / 10;
  const totalFat = Math.round(logs.reduce((acc, curr) => acc + curr.fat, 0) * 10) / 10;
  const totalCarbs = Math.round(logs.reduce((acc, curr) => acc + curr.carbs, 0) * 10) / 10;
  const totalFiber = Math.round(logs.reduce((acc, curr) => acc + (curr.fiber || 0), 0) * 10) / 10;

  const handleScanPress = () => {
    router.push("/(app)/scanner/scan" as any);
  };

  const handleManualPress = () => {
    router.push("/(app)/scanner/manual" as any);
  };

  const LogItem = React.memo(({ item }: { item: NutritionLog }) => (
    <View className="flex-row items-center gap-4 p-4 bg-surface-low rounded-[24px] mb-3 border border-outline-variant/10">
      <View className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/20 bg-primary-light">
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} className="w-full h-full" contentFit="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <IconSymbol name="doc.text.fill" size={20} color="#3e646a" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text className="font-bold text-on-surface text-sm flex-1 pr-2" numberOfLines={1}>
            {item.foodDetected.join(", ")}
          </Text>
          <Text className="text-[10px] text-outline font-bold">{formatTime(item.createdAt)}</Text>
        </View>
        <Text className="text-[10px] text-primary font-bold mt-0.5" numberOfLines={1}>
          {item.portionEstimate}
        </Text>
        <Text className="text-[11px] text-outline mt-1 font-semibold">
          {item.calories} kkal • P: {item.protein}g • L: {item.fat}g • K: {item.carbs}g • S: {item.fiber || 0}g
        </Text>
      </View>
      <Pressable onPress={() => removeLog(item.id)} className="p-1.5 rounded-full hover:bg-danger-light active:scale-95">
        <IconSymbol name="plus" size={18} color="#ba1a1a" style={deleteIconStyle} />
      </Pressable>
    </View>
  ));

  LogItem.displayName = "LogItem";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Top AppBar */}
      <View className="w-full flex-row justify-between items-center px-container-padding py-4 border-b border-surface-container bg-surface-lowest">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
            <IconSymbol name="doc.text.fill" size={20} color="#3e646a" />
          </View>
          <Text className="font-bold text-lg text-primary">Log Nutrisi Anak</Text>
        </View>
        <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/40">
          <Image
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDNo7cQUNctrRjKfFyO0beDmlnMVuCR58pAdnHNOg0TG8G0jxun6sTPVqx-rvzgSg_vL6PxecUjBwCQZafL9hBtPvbRVhfoaHqQ8YxhDxXeEI-R5JP42AamTjvAZ4K6VwnRIiKdZOeIE9CWARiMntbtlP-XYTAWDrccYD4e6yT0SkFe8jiYXX1uP9TQf1DLTjIye4fRmJCApiD7ycO1sionPND39QIFLDPBcjRlfxREqzFD5KEXLZJc_wROSafiBQcXDhNl3wrAqA" }}
            className="w-full h-full" contentFit="cover"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Daily Summary Card */}
        <View className="px-container-padding pt-6 pb-2">
          <Card className="bg-primary/5 border border-primary/10">
            <CardContent>
              <Text className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Total Nutrisi Hari Ini</Text>
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-3xl font-extrabold text-on-surface">{totalCalories}</Text>
                  <Text className="text-xs text-outline">Kalori Terpenuhi (kkal)</Text>
                </View>
                <View className="bg-primary-light px-3.5 py-1.5 rounded-full">
                  <Text className="text-xs font-bold text-primary">Target: 800 kkal</Text>
                </View>
              </View>
              <View className="flex-row gap-2 pt-3 border-t border-primary/10 justify-between">
                <View className="items-center">
                  <Text className="font-extrabold text-xs text-on-surface">{totalProtein}g</Text>
                  <Text className="text-[9px] text-outline mt-0.5">Protein</Text>
                </View>
                <View className="items-center">
                  <Text className="font-extrabold text-xs text-on-surface">{totalFat}g</Text>
                  <Text className="text-[9px] text-outline mt-0.5">Lemak</Text>
                </View>
                <View className="items-center">
                  <Text className="font-extrabold text-xs text-on-surface">{totalCarbs}g</Text>
                  <Text className="text-[9px] text-outline mt-0.5">Karbohidrat</Text>
                </View>
                <View className="items-center">
                  <Text className="font-extrabold text-xs text-on-surface">{totalFiber}g</Text>
                  <Text className="text-[9px] text-outline mt-0.5">Serat</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Primary Entry Methods: Bento Layout */}
        <View className="px-container-padding py-4 flex-row gap-4">
          <Pressable
            onPress={handleScanPress}
            className="flex-1 overflow-hidden flex-col items-start p-5 rounded-[24px] bg-primary-light text-on-primary-container soft-float text-left transition-all active:scale-95 duration-200 border border-primary/20"
          >
            <View className="mb-4 bg-surface-lowest p-2.5 rounded-full shadow-[0_2px_10px_rgba(62,100,106,0.08)]">
              <IconSymbol name="qrcode.viewfinder" size={26} color="#3e646a" />
            </View>
            <Text className="font-bold text-base text-primary mb-1">AI Vision Scan</Text>
            <Text className="text-[11px] text-on-primary-container/85 leading-4">
              Foto makanan bayi Anda, Gemini AI hitung gizinya secara otomatis.
            </Text>
          </Pressable>

          <Pressable
            onPress={handleManualPress}
            className="flex-1 flex-col items-start p-5 rounded-[24px] bg-surface-low text-on-surface-variant soft-float text-left transition-all active:scale-95 duration-200 border border-outline-variant/30"
          >
            <View className="mb-4 bg-surface-lowest p-2.5 rounded-full shadow-[0_2px_10px_rgba(62,100,106,0.08)]">
              <IconSymbol name="plus" size={26} color="#3e646a" />
            </View>
            <Text className="font-bold text-base text-on-surface mb-1">Input Manual</Text>
            <Text className="text-[11px] text-outline leading-4">
              Cari dari ribuan database makanan lokal dan MPASI buatan rumah.
            </Text>
          </Pressable>
        </View>

        {/* Saran Menu MPASI */}
        <View className="py-4">
          <View className="flex-row justify-between items-center px-container-padding mb-3">
            <Text className="font-bold text-base text-on-surface">Saran Menu MPASI</Text>
            <Pressable>
              <Text className="text-xs text-primary font-bold">Lihat Semua</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            className="gap-4"
          >
            {SUGGESTIONS.map((item) => (
              <Card key={item.id} size="sm" className="w-[200px] mr-3 p-0 pb-3">
                <View className="h-28 w-full relative">
                  <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-t-[24px]" contentFit="cover" />
                  <View className="absolute top-2 right-2 bg-secondary-container px-2 py-0.5 rounded-full">
                    <Text className="text-[9px] font-bold text-on-secondary-container">{item.ageRange}</Text>
                  </View>
                </View>
                <View className="px-3 pt-3 gap-0.5">
                  <Text className="font-bold text-xs text-on-surface">{item.name}</Text>
                  <Text className="text-[10px] text-outline font-medium">{item.description}</Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Riwayat Hari Ini */}
        <View className="px-container-padding py-4">
          <Text className="font-bold text-base text-on-surface mb-3">Riwayat Hari Ini</Text>
          {logs.length === 0 ? (
            <View className="bg-surface-low border border-outline-variant/10 rounded-[24px] p-8 items-center justify-center">
              <Text className="text-2xl mb-1">🍽️</Text>
              <Text className="text-xs text-outline font-medium">Belum ada makanan yang dicatat hari ini</Text>
            </View>
          ) : (
            logs.map((log) => <LogItem key={log.id} item={log} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
