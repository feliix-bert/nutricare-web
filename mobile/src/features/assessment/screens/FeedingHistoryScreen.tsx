import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useChild } from "@/features/children/hooks/useChildren";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export const FeedingHistoryScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? "");

  const { bfExclusive, mpasiAge, mealFreq, setBfExclusive, setMpasiAge, setMealFreq } = useAssessmentFormStore();

  const [errors, setErrors] = useState<{ mpasiAge?: string; mealFreq?: string }>({});

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  const handleNext = () => {
    const errs: { mpasiAge?: string; mealFreq?: string } = {};
    const mpasiNum = parseFloat(mpasiAge);
    const freqNum = parseInt(mealFreq, 10);

    if (!mpasiAge) {
      errs.mpasiAge = "Usia mulai MPASI wajib diisi.";
    } else if (isNaN(mpasiNum) || mpasiNum < 0 || mpasiNum > 24) {
      errs.mpasiAge = "Usia mulai MPASI harus di antara 0 - 24 bulan.";
    }

    if (!mealFreq) {
      errs.mealFreq = "Frekuensi makan wajib diisi.";
    } else if (isNaN(freqNum) || freqNum <= 0 || freqNum > 10) {
      errs.mealFreq = "Frekuensi makan harus angka positif antara 1 - 10.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    router.push({
      pathname: `/(app)/children/${child.id}/assessment/illness-history`,
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header & Step Indicator */}
      <View className="px-container-padding py-4 border-b border-surface-container bg-surface-lowest flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-1 rounded-full active:scale-95">
            <IconSymbol name="arrow.left" size={20} color="#3e646a" />
          </Pressable>
          <Text className="font-bold text-lg text-primary ml-3">Riwayat Makan (MPASI)</Text>
        </View>
        <Text className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 3 dari 5
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Step Info */}
        <View className="bg-primary/5 border border-primary/10 rounded-[24px] p-4 flex-row items-center gap-3">
          <IconSymbol name="info.circle" size={18} color="#3e646a" />
          <Text className="text-xs text-primary leading-4 flex-1">
            Riwayat pemberian ASI eksklusif dan pola makan sangat berpengaruh terhadap pemenuhan gizi makro dan mikro
            anak.
          </Text>
        </View>

        {/* Inputs */}
        <View className="gap-6 mt-4">
          {/* ASI Eksklusif */}
          <View className="flex-row items-center justify-between bg-surface-lowest p-5 rounded-[24px] border border-outline-variant/15">
            <View className="flex-1 pr-4">
              <Text className="font-bold text-sm text-on-surface">ASI Eksklusif (6 Bulan)</Text>
              <Text className="text-xs text-outline leading-4 mt-0.5">
                Apakah anak mendapatkan ASI eksklusif penuh selama 6 bulan pertama tanpa tambahan makanan?
              </Text>
            </View>
            <Switch
              value={bfExclusive}
              onValueChange={setBfExclusive}
              trackColor={{ false: "#e0e2e2", true: "#3e646a" }}
              thumbColor={bfExclusive ? "#ffffff" : "#f4f5f5"}
            />
          </View>

          {/* Usia Mulai MPASI */}
          <InputField
            label="Usia Mulai MPASI (bulan)"
            value={mpasiAge}
            onChangeText={(t) => {
              setMpasiAge(t);
              setErrors((prev) => ({ ...prev, mpasiAge: undefined }));
            }}
            placeholder="Contoh: 6"
            keyboardType="numeric"
            error={errors.mpasiAge}
            rightElement={<Text className="text-xs text-outline font-bold">bulan</Text>}
          />

          {/* Frekuensi Makan */}
          <InputField
            label="Frekuensi Makan Utama (per hari)"
            value={mealFreq}
            onChangeText={(t) => {
              setMealFreq(t);
              setErrors((prev) => ({ ...prev, mealFreq: undefined }));
            }}
            placeholder="Contoh: 3"
            keyboardType="numeric"
            error={errors.mealFreq}
            rightElement={<Text className="text-xs text-outline font-bold">kali</Text>}
          />
        </View>

        <Button onPress={handleNext} variant="primary" className="mt-8">
          Lanjutkan ke Riwayat Penyakit
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
