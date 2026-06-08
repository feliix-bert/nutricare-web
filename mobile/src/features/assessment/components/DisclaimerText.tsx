import React from "react";
import { View, Text } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

export const DisclaimerText = () => {
  return (
    <View className="bg-amber-500/5 border border-amber-500/25 rounded-[24px] p-4 flex-row items-start gap-3">
      <View className="bg-amber-500/10 p-2 rounded-full mt-0.5">
        <IconSymbol name="info.circle" size={16} color="#b45309" />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-0.5">
          Peringatan Klinis
        </Text>
        <Text className="text-[11px] text-amber-800/90 leading-4 font-semibold">
          Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.
        </Text>
      </View>
    </View>
  );
};
