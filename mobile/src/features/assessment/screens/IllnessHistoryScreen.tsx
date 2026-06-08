import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useChild } from "@/features/children/hooks/useChildren";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export const IllnessHistoryScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? "");

  const { illnessHistory, setIllnessHistory } = useAssessmentFormStore();

  const [error, setError] = useState<string | undefined>();

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  const handleNext = () => {
    if (illnessHistory.length > 500) {
      setError("Riwayat penyakit maksimal 500 karakter.");
      return;
    }

    setError(undefined);
    router.push({
      pathname: `/(app)/children/${child.id}/assessment/review`,
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
          <Text className="font-bold text-lg text-primary ml-3">Riwayat Penyakit Anak</Text>
        </View>
        <Text className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 4 dari 5
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Step Info */}
        <View className="bg-primary/5 border border-primary/10 rounded-[24px] p-4 flex-row items-center gap-3">
          <IconSymbol name="info.circle" size={18} color="#3e646a" />
          <Text className="text-xs text-primary leading-4 flex-1">
            Catat riwayat penyakit infeksi seperti diare, ISPA (Infeksi Saluran Pernapasan Akut), atau demam berulang.
            Penyakit infeksi kronis dapat menghambat penyerapan nutrisi si kecil.
          </Text>
        </View>

        {/* Multiline Input */}
        <View className="gap-2 mt-4">
          <Text className="text-sm font-semibold text-on-surface">
            Catatan Riwayat Penyakit (ISPA, Diare, Demam, dll.)
          </Text>
          <View
            className={`border rounded-[24px] px-5 py-4 bg-surface-lowest ${
              error ? "border-danger" : "border-outline-variant/30"
            }`}
          >
            <TextInput
              multiline
              numberOfLines={6}
              value={illnessHistory}
              onChangeText={(t) => {
                setIllnessHistory(t);
                setError(undefined);
              }}
              placeholder="Contoh: Mengalami diare 2 kali dalam 3 bulan terakhir, dan flu/ISPA ringan sebulan sekali. Tidak ada riwayat penyakit kronis bawaan."
              placeholderTextColor="#717879"
              className="text-base text-on-surface min-h-[120px] text-left"
              style={{ textAlignVertical: "top" }}
              maxLength={500}
            />
          </View>
          <View className="flex-row justify-between px-1">
            {error ? (
              <Text className="text-xs font-medium text-danger">{error}</Text>
            ) : (
              <Text className="text-xs text-outline font-medium">
                Opsional (Kosongkan jika tidak ada riwayat penyakit)
              </Text>
            )}
            <Text className="text-xs text-outline font-medium">{illnessHistory.length}/500</Text>
          </View>
        </View>

        <Button onPress={handleNext} variant="primary" className="mt-8">
          Lanjutkan ke Review & Tanda Tangan
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
