import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useChild } from "@/features/children/hooks/useChildren";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export const BodySizeScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? "");
  const { weight, height, headCircumference, setWeight, setHeight, setHeadCircumference } = useAssessmentFormStore();
  const [errors, setErrors] = useState<{ weight?: string; height?: string; headCircumference?: string }>({});

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  const handleNext = () => {
    const errs: { weight?: string; height?: string; headCircumference?: string } = {};
    const wNum = parseFloat(weight);
    const hNum = parseFloat(height);
    const hcNum = parseFloat(headCircumference);

    if (!weight) {
      errs.weight = "Berat badan wajib diisi.";
    } else if (isNaN(wNum) || wNum <= 0) {
      errs.weight = "Berat badan harus angka positif.";
    }

    if (!height) {
      errs.height = "Tinggi badan wajib diisi.";
    } else if (isNaN(hNum) || hNum <= 0) {
      errs.height = "Tinggi badan harus angka positif.";
    }

    if (!headCircumference) {
      errs.headCircumference = "Lingkar kepala wajib diisi.";
    } else if (isNaN(hcNum) || hcNum < 20 || hcNum > 60) {
      errs.headCircumference = "Lingkar kepala harus antara 20 - 60 cm.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    router.push({
      pathname: `/(app)/children/${child.id}/assessment/feeding-history`,
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
          <Text className="font-bold text-lg text-primary ml-3">Input Ukuran Tubuh</Text>
        </View>
        <Text className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 2 dari 5
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Child preview */}
        <View className="flex-row items-center gap-3 bg-surface-lowest p-4 rounded-[24px] border border-outline-variant/15">
          <Text className="text-3xl">{child.gender === "MALE" ? "👦" : "👧"}</Text>
          <View>
            <Text className="font-bold text-on-surface text-sm">{child.name}</Text>
            <Text className="text-xs text-outline font-medium">{child.ageMonths} bulan</Text>
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-primary/5 border border-primary/10 rounded-[24px] p-4 flex-row items-center gap-3">
          <IconSymbol name="info.circle" size={18} color="#3e646a" />
          <Text className="text-xs text-primary leading-4 flex-1">
            Pengukuran antropometri (berat badan, panjang badan, dan lingkar kepala) wajib diisi untuk menilai status
            pertumbuhan secara presisi.
          </Text>
        </View>

        {/* Inputs */}
        <View className="gap-6 mt-4">
          {/* Weight */}
          <InputField
            label="Berat Badan (kg)"
            value={weight}
            onChangeText={(t) => {
              setWeight(t);
              setErrors((prev) => ({ ...prev, weight: undefined }));
            }}
            placeholder="Contoh: 9.5"
            keyboardType="numeric"
            error={errors.weight}
            rightElement={<Text className="text-xs text-outline font-bold">kg</Text>}
          />

          {/* Height */}
          <InputField
            label="Tinggi / Panjang Badan (cm)"
            value={height}
            onChangeText={(t) => {
              setHeight(t);
              setErrors((prev) => ({ ...prev, height: undefined }));
            }}
            placeholder="Contoh: 78.2"
            keyboardType="numeric"
            error={errors.height}
            rightElement={<Text className="text-xs text-outline font-bold">cm</Text>}
          />

          {/* Head Circumference */}
          <InputField
            label="Lingkar Kepala (cm)"
            value={headCircumference}
            onChangeText={(t) => {
              setHeadCircumference(t);
              setErrors((prev) => ({ ...prev, headCircumference: undefined }));
            }}
            placeholder="Contoh: 45.5"
            keyboardType="numeric"
            error={errors.headCircumference}
            rightElement={<Text className="text-xs text-outline font-bold">cm</Text>}
          />
        </View>

        <Button onPress={handleNext} variant="primary" className="mt-8">
          Lanjutkan ke Riwayat Makan
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
