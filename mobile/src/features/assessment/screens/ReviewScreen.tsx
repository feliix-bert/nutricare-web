import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useChild } from "@/features/children/hooks/useChildren";
import { useVaultStore } from "@/stores/vaultStore";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { addMockAssessment } from "@/services/mock";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Card, CardContent } from "@/components/ui/Card";

export const ReviewScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? "");
  const addRecord = useVaultStore((s) => s.addRecord);

  const {
    weight,
    height,
    headCircumference,
    bfExclusive,
    mpasiAge,
    mealFreq,
    illnessHistory,
    resetForm,
  } = useAssessmentFormStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  const wNum = parseFloat(weight || "0");
  const hNum = parseFloat(height || "0");
  const hcNum = parseFloat(headCircumference || "0");
  const mpasiNum = parseFloat(mpasiAge || "6");
  const freqNum = parseInt(mealFreq || "3", 10);

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const resDto = addMockAssessment({
        childId: child.id,
        weight: wNum,
        height: hNum,
        headCircumference: hcNum,
        bfExclusive,
        mpasiAge: mpasiNum,
        mealFreq: freqNum,
        illnessHistory: illnessHistory,
      });

      // 2. Add record to blockchain vault store for user dashboard log
      addRecord({
        childId: child.id,
        childName: child.name,
        weight: wNum,
        height: hNum,
        ageMonths: child.ageMonths,
        status: resDto.prediction.status,
      });

      // 3. Reset store data
      resetForm();
      setIsSubmitting(false);

      // 4. Navigate to results page with full prediction DTO params
      router.push({
        pathname: `/(app)/children/${child.id}/assessment/results`,
        params: {
          status: resDto.prediction.status,
          weight: String(wNum),
          height: String(hNum),
          headCircumference: String(hcNum),
          txHash: resDto.blockchain.txHash,
          blockNumber: String(resDto.blockchain.blockNumber),
          zscoreWa: String(resDto.prediction.zscoreWa),
          zscoreHa: String(resDto.prediction.zscoreHa),
          zscoreWh: String(resDto.prediction.zscoreWh),
          summary: resDto.prediction.summary,
          recommendations: JSON.stringify(resDto.prediction.recommendations),
          nextAssessmentDate: resDto.prediction.nextAssessmentDate,
          disclaimer: resDto.prediction.disclaimer,
        },
      } as any);
    }, 1800);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header & Step Indicator */}
      <View className="px-container-padding py-4 border-b border-surface-container bg-surface-lowest flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-1 rounded-full active:scale-95">
            <IconSymbol name="arrow.left" size={20} color="#3e646a" />
          </Pressable>
          <Text className="font-bold text-lg text-primary ml-3">Review & Kirim</Text>
        </View>
        <Text className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 5 dari 5
        </Text>
      </View>

      {isSubmitting ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <ActivityIndicator size="large" color="#3e646a" />
          <Text className="font-bold text-on-surface text-base">Menulis Blok ke GiziChain...</Text>
          <Text className="text-xs text-outline text-center">
            Memverifikasi tanda tangan kriptografi ECDSA (secp256k1) dan menyebarkan transaksi ke ledger.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
          {/* Child Card Header */}
          <View className="bg-surface-lowest p-4 rounded-[24px] border border-outline-variant/15 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">{child.gender === "MALE" ? "👦" : "👧"}</Text>
              <View>
                <Text className="font-bold text-on-surface text-sm">{child.name}</Text>
                <Text className="text-xs text-outline font-medium">{child.ageMonths} bulan</Text>
              </View>
            </View>
          </View>

          {/* Section: Antropometri */}
          <View className="gap-2">
            <Text className="font-bold text-xs text-outline uppercase tracking-wider">1. Parameter Antropometri</Text>
            <Card className="p-0">
              <View className="flex-row justify-between items-center p-4">
                <View className="items-center flex-1">
                  <Text className="text-xs text-outline font-bold">Tinggi</Text>
                  <Text className="font-bold text-on-surface text-sm mt-0.5">{weight} kg</Text>
                </View>
                <View className="w-px h-8 bg-surface-container" />
                <View className="items-center flex-1">
                  <Text className="text-xs text-outline font-bold">Panjang</Text>
                  <Text className="font-bold text-on-surface text-sm mt-0.5">{height} cm</Text>
                </View>
                <View className="w-px h-8 bg-surface-container" />
                <View className="items-center flex-1">
                  <Text className="text-xs text-outline font-bold">L. Kepala</Text>
                  <Text className="font-bold text-on-surface text-sm mt-0.5">{headCircumference} cm</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Section: Riwayat Makan */}
          <View className="gap-2">
            <Text className="font-bold text-xs text-outline uppercase tracking-wider">2. Riwayat Makan</Text>
            <Card className="p-4 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline font-medium">ASI Eksklusif (6 bln)</Text>
                <Text className="text-xs font-bold text-on-surface">{bfExclusive ? "Ya" : "Tidak"}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline font-medium">Usia Mulai MPASI</Text>
                <Text className="text-xs font-bold text-on-surface">{mpasiAge} bulan</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline font-medium">Frekuensi Makan</Text>
                <Text className="text-xs font-bold text-on-surface">{mealFreq} kali / hari</Text>
              </View>
            </Card>
          </View>

          {/* Section: Riwayat Penyakit */}
          <View className="gap-2">
            <Text className="font-bold text-xs text-outline uppercase tracking-wider">3. Riwayat Penyakit</Text>
            <Card className="p-4">
              <Text className="text-xs text-on-surface leading-5 font-semibold">
                {illnessHistory.trim() ? illnessHistory : "Tidak ada catatan riwayat penyakit."}
              </Text>
            </Card>
          </View>

          {/* Blockchain Gas Proof */}
          <View className="gap-2">
            <Text className="font-bold text-xs text-outline uppercase tracking-wider">Kalkulasi Ledger Gas</Text>
            <Card className="p-4 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline font-medium">Metode Tanda Tangan</Text>
                <Text className="text-xs font-bold text-on-surface">ECDSA (secp256k1)</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline font-medium">Block Gas Cost</Text>
                <Text className="text-xs font-bold text-secondary">0.00045 GZI (Free Tier)</Text>
              </View>
            </Card>
          </View>

          <Button onPress={handleConfirmSubmit} variant="primary" className="mt-4">
            Tanda Tangan & Kirim ke GiziChain
          </Button>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
