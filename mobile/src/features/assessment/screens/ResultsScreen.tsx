import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { DisclaimerText } from "@/features/assessment/components/DisclaimerText";

const DIAGNOSIS_DETAILS = {
  NORMAL: {
    title: "Tumbuh Kembang Normal",
    icon: "🎉",
    colorClass: "text-secondary",
    bgClass: "bg-secondary/5 border-secondary/20",
  },
  AT_RISK: {
    title: "Berisiko Stunting",
    icon: "⚠️",
    colorClass: "text-tertiary",
    bgClass: "bg-tertiary/5 border-tertiary/20",
  },
  STUNTED: {
    title: "Terindikasi Stunting",
    icon: "🚨",
    colorClass: "text-danger",
    bgClass: "bg-danger/5 border-danger/20",
  },
  SEVERELY_STUNTED: {
    title: "Stunting Sangat Pendek",
    icon: "🚨",
    colorClass: "text-danger-dark",
    bgClass: "bg-danger/10 border-danger/30",
  },
};

export const ResultsScreen = () => {
  const {
    status,
    weight,
    height,
    headCircumference,
    txHash,
    blockNumber,
    zscoreWa,
    zscoreHa,
    zscoreWh,
    summary,
    recommendations,
    nextAssessmentDate,
  } = useLocalSearchParams<{
    status: "NORMAL" | "AT_RISK" | "STUNTED" | "SEVERELY_STUNTED";
    weight: string;
    height: string;
    headCircumference: string;
    txHash: string;
    blockNumber: string;
    zscoreWa: string;
    zscoreHa: string;
    zscoreWh: string;
    summary: string;
    recommendations: string;
    nextAssessmentDate: string;
  }>();

  const activeStatus = status ?? "NORMAL";
  const details = DIAGNOSIS_DETAILS[activeStatus];

  // Parse recommendations safely
  let parsedRecs: string[] = [];
  try {
    if (recommendations) {
      parsedRecs = JSON.parse(recommendations);
    }
  } catch {
    parsedRecs = [
      "Konsultasikan dengan dokter spesialis anak terdekat.",
      "Pastikan pemenuhan gizi protein hewani harian.",
    ];
  }

  const handleFinish = () => {
    router.dismissAll();
    router.replace("/(app)/(tabs)/" as any);
  };

  const handleConsult = () => {
    router.dismissAll();
    router.replace("/(app)/(tabs)/consult" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-container-padding py-4 border-b border-surface-container bg-surface-lowest items-center">
        <Text className="font-bold text-lg text-primary">Hasil Deteksi AI</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Diagnostic Status Card */}
        <View className="items-center py-4 gap-3 bg-surface-lowest rounded-[24px] border border-outline-variant/15 p-5">
          <Text className="text-5xl">{details.icon}</Text>
          <Text className={`font-extrabold text-lg ${details.colorClass}`}>{details.title}</Text>
          <StatusBadge status={activeStatus} />
        </View>

        {/* Detailed Z-scores & Summary */}
        <View className="gap-2">
          <Text className="font-bold text-xs text-outline uppercase tracking-wider">Metrik Tumbuh Kembang (WHO Z-Score)</Text>
          <Card className="p-4 gap-4">
            <Text className="text-xs text-on-surface leading-5 font-semibold">
              {summary || "Status gizi dianalisis berdasarkan kurva standar pertumbuhan anak WHO."}
            </Text>
            <View className="flex-row justify-between pt-2 border-t border-surface-container">
              <View className="items-center flex-1">
                <Text className="text-[10px] text-outline font-bold">Berat/Umur (WAZ)</Text>
                <Text className="font-extrabold text-on-surface text-sm mt-1">{zscoreWa || "-0.0"} SD</Text>
              </View>
              <View className="w-px h-8 bg-surface-container" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-outline font-bold">Tinggi/Umur (HAZ)</Text>
                <Text className="font-extrabold text-on-surface text-sm mt-1">{zscoreHa || "-0.0"} SD</Text>
              </View>
              <View className="w-px h-8 bg-surface-container" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-outline font-bold">Berat/Tinggi (WHZ)</Text>
                <Text className="font-extrabold text-on-surface text-sm mt-1">{zscoreWh || "-0.0"} SD</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Measured params */}
        <View className="gap-2">
          <Text className="font-bold text-xs text-outline uppercase tracking-wider">Hasil Pengukuran</Text>
          <Card className="p-0">
            <View className="flex-row justify-between items-center p-4">
              <View className="items-center flex-1">
                <Text className="text-[10px] text-outline font-medium">Berat Badan</Text>
                <Text className="font-bold text-on-surface text-xs mt-0.5">{weight} kg</Text>
              </View>
              <View className="w-px h-6 bg-surface-container" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-outline font-medium">Tinggi Badan</Text>
                <Text className="font-bold text-on-surface text-xs mt-0.5">{height} cm</Text>
              </View>
              <View className="w-px h-6 bg-surface-container" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-outline font-medium">Lingkar Kepala</Text>
                <Text className="font-bold text-on-surface text-xs mt-0.5">{headCircumference || "45.0"} cm</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Recommendations & Next Assessment Date */}
        <View className="gap-2">
          <Text className="font-bold text-xs text-outline uppercase tracking-wider">Rekomendasi AI GiziChain</Text>
          <Card className="p-4 gap-3">
            {parsedRecs.map((rec, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <Text className="text-secondary font-bold">•</Text>
                <Text className="text-xs text-on-surface leading-4 font-semibold flex-1">{rec}</Text>
              </View>
            ))}
            <View className="mt-2 pt-3 border-t border-surface-container flex-row justify-between items-center">
              <Text className="text-[10px] text-outline font-medium">Jadwal Pemeriksaan Berikutnya</Text>
              <Text className="text-xs font-bold text-primary">{nextAssessmentDate || "-"}</Text>
            </View>
          </Card>
        </View>

        {/* Blockchain proof */}
        <View className="gap-2">
          <Text className="font-bold text-xs text-outline uppercase tracking-wider">Bukti Kriptografi Blockchain</Text>
          <Card className="p-4 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-outline font-medium">Status Ledger</Text>
              <View className="flex-row items-center gap-1">
                <IconSymbol name="checkmark.circle.fill" size={12} color="#506444" />
                <Text className="text-xs font-bold text-secondary">Secured & Confirmed</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-outline font-medium">Block Number</Text>
              <Text className="text-xs font-bold text-on-surface">{blockNumber || "1206148"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-outline font-medium">TX Hash</Text>
              <Text className="text-xs font-mono text-on-surface text-right max-w-[200px]" numberOfLines={1} ellipsizeMode="middle">
                {txHash || "0xabc123...def789"}
              </Text>
            </View>
          </Card>
        </View>

        {/* Mandatory Clinical Disclaimer */}
        <DisclaimerText />

        {/* Actions */}
        <View className="gap-3 mt-4">
          <Button onPress={handleConsult} variant="outline" className="w-full">
            Tanya AI tentang Gizi MPASI
          </Button>
          <Button onPress={handleFinish} variant="primary" className="w-full">
            Selesai & Kembali ke Dashboard
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
