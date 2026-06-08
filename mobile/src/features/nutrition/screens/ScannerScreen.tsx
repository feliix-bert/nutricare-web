import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { useBounceAnimation } from "@/hooks/useBounceAnimation";

export const ScannerScreen = () => {
  const [isUploading, setIsUploading] = useState(false);
  const animatedIconStyle = useBounceAnimation();

  const handleCapture = () => {
    setIsUploading(true);
    // Simulating camera delay
    setTimeout(() => {
      setIsUploading(false);
      router.push("/(app)/scanner/analysis" as any);
    }, 1200);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-6 py-4 absolute top-12 left-0 right-0 z-10">
        <Pressable onPress={handleGoBack} className="w-10 h-10 rounded-full bg-black/45 items-center justify-center">
          <IconSymbol name="arrow.left" size={20} color="#ffffff" />
        </Pressable>
        <Text className="text-white font-bold text-base">AI Vision Scan</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Simulated Camera Viewfinder */}
      <View className="flex-1 items-center justify-center">
        {isUploading ? (
          <View className="items-center gap-3 bg-black/70 p-6 rounded-[32px] border border-white/10">
            <Animated.Text className="text-4xl" style={animatedIconStyle}>⚡</Animated.Text>
            <Text className="text-white font-bold text-sm">Mengupload Gambar...</Text>
            <Text className="text-xs text-gray-400">Gemini sedang memproses data</Text>
          </View>
        ) : (
          <View className="w-72 h-72 border-2 border-primary border-dashed rounded-[32px] items-center justify-center opacity-65">
            <IconSymbol name="qrcode.viewfinder" size={64} color="#3e646a" />
            <Text className="text-white text-xs mt-3 font-medium text-center px-8">
              Posisikan piring makanan si kecil di dalam kotak ini
            </Text>
          </View>
        )}
      </View>

      {/* Camera Controls Panel */}
      <View className="px-6 pb-12 pt-6 bg-zinc-900 border-t border-zinc-800 gap-6">
        <Text className="text-zinc-400 text-xs text-center leading-4">
          Arahkan kamera ke MPASI buatan sendiri atau makanan si kecil untuk mendeteksi bahan makanan, porsi, dan taksiran kalori secara instan.
        </Text>

        <View className="flex-row justify-around items-center">
          {/* Gallery Upload Option */}
          <Pressable onPress={handleCapture} className="items-center gap-1">
            <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center active:scale-95">
              <IconSymbol name="doc.text.fill" size={20} color="#ffffff" />
            </View>
            <Text className="text-zinc-400 text-[10px] font-bold">Galeri</Text>
          </Pressable>

          {/* Shutter Button */}
          <Pressable
            onPress={handleCapture}
            disabled={isUploading}
            className="w-20 h-20 rounded-full border-4 border-white items-center justify-center p-1 active:scale-95"
          >
            <View className="w-full h-full rounded-full bg-white" />
          </Pressable>

          {/* Flash Toggle */}
          <Pressable className="items-center gap-1 opacity-50">
            <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center">
              <IconSymbol name="info.circle" size={20} color="#ffffff" />
            </View>
            <Text className="text-zinc-400 text-[10px] font-bold">Flash</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
