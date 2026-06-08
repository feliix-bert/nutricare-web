import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { useNutritionStore } from "@/stores/nutritionStore";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useBounceAnimation } from "@/hooks/useBounceAnimation";

const STEPS = [
  "Menganalisis gambar makanan si kecil...",
  "Mengidentifikasi bahan makanan (Salmon, Wortel, Beras Merah)...",
  "Menghitung kalori dan komposisi makronutrisi...",
  "Menyimpan data log gizi ke akun...",
];

export const AnalysisScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const addLog = useNutritionStore((s) => s.addLog);
  const animatedIconStyle = useBounceAnimation();

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // Completed, add mock record and redirect
      addLog({
        childId: "child_001",
        photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=240&auto=format&fit=crop",
        foodDetected: ["Bubur Salmon", "Beras Merah", "Wortel"],
        portionEstimate: "Porsi Sedang (~200g)",
        calories: 145,
        protein: 6.5,
        fat: 4.0,
        carbs: 21.0,
        fiber: 2.2,
        adequacyNote: "Sangat baik untuk pemenuhan gizi protein dan omega-3 makan siang anak.",
        mpasiRecommendation: "Tambahkan porsi lemak sehat seperti 1 sdt minyak zaitun.",
      });
      router.replace("/(app)/(tabs)/scanner" as any);
    }
  }, [currentStep, addLog]);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <View className="items-center gap-6">
        {/* Animated Icon */}
        <View className="w-24 h-24 rounded-full bg-primary-light items-center justify-center shadow-lg border border-primary/20">
          <Animated.Text className="text-4xl" style={animatedIconStyle}>🥗</Animated.Text>
        </View>

        <View className="items-center gap-2">
          <Text className="font-extrabold text-xl text-primary text-center">Gemini AI Vision Analysis</Text>
          <Text className="text-xs text-outline text-center px-6 leading-4">
            Kami sedang memproses foto makanan dengan model kecerdasan buatan Gemini.
          </Text>
        </View>

        {/* Steps List */}
        <View className="w-full max-w-sm mt-8 gap-4 px-4">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <View key={idx} className="flex-row items-center gap-3 opacity-90">
                <View className="w-6 h-6 items-center justify-center">
                  {isCompleted ? (
                    <IconSymbol name="checkmark.circle.fill" size={18} color="#506444" />
                  ) : isActive ? (
                    <ActivityIndicator size="small" color="#3e646a" />
                  ) : (
                    <View className="w-2.5 h-2.5 rounded-full bg-surface-dim" />
                  )}
                </View>
                <Text
                  className={`text-xs flex-1 ${
                    isCompleted
                      ? "text-secondary font-bold line-through opacity-60"
                      : isActive
                      ? "text-primary font-bold"
                      : "text-outline font-medium"
                  }`}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};
