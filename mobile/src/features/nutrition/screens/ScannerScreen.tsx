import React, { useState, useRef, useEffect } from "react";
import { Pressable, Text, View, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useBounceAnimation } from "@/hooks/useBounceAnimation";
import { useChildrenList } from "@/features/children/hooks/useChildren";
import { useUploadNutrition } from "@/features/nutrition/hooks/useNutrition";

export const ScannerScreen = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const animatedIconStyle = useBounceAnimation();
  const { data: childrenData } = useChildrenList();
  const childId = childrenData?.data?.[0]?.id; // Default to first child for MVP
  const uploadNutrition = useUploadNutrition(childId ?? "");

  if (!permission) {
    // Camera permissions are still loading.
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-center mb-6">
          Kami membutuhkan izin kamera Anda untuk memindai makanan.
        </Text>
        <Pressable 
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Beri Izin Kamera</Text>
        </Pressable>
      </View>
    );
  }

  const handleProcessImage = async (uri: string) => {
    if (!childId) {
      Alert.alert("Error", "Pilih data anak terlebih dahulu di Beranda.");
      return;
    }

    setIsUploading(true);
    
    // Simulate navigation with query params for analysis state
    // Real implementation would upload first, then navigate
    // Or navigate first, then upload in the background
    
    // TODO: implement real camera
    try {
      // In real implementation, this would be uncommented
      /* 
      await uploadNutrition.mutateAsync({
        childId,
        photo: {
          uri,
          name: "scan.jpg",
          type: "image/jpeg",
        }
      });
      */
      
      // Navigate to analysis screen, we could pass the image URI if we want to show it
      router.push({
        pathname: "/(app)/scanner/analysis",
        params: { childId, imageUri: uri }
      });
    } catch (error) {
      Alert.alert("Gagal Upload", "Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isUploading) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7, // Compress a bit to stay under 5MB limit
      });
      
      if (photo?.uri) {
        handleProcessImage(photo.uri);
      }
    } catch (error) {
      console.error("Camera capture error:", error);
      Alert.alert("Error", "Gagal mengambil foto.");
    }
  };

  const handleGalleryPicker = async () => {
    if (isUploading) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        handleProcessImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery picker error:", error);
      Alert.alert("Error", "Gagal membuka galeri.");
    }
  };

  const toggleFlash = () => {
    setFlash(current => (current === "off" ? "on" : "off"));
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

      {/* Camera Viewfinder */}
      <View className="flex-1 rounded-3xl overflow-hidden m-4 mt-24 mb-4 relative">
        <CameraView 
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject} 
          facing={facing}
          flash={flash}
        />
        
        {/* Overlay Grid/Frame */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          {isUploading ? (
            <View className="items-center gap-3 bg-black/80 p-6 rounded-[32px] border border-white/10">
              <Animated.Text className="text-4xl" style={animatedIconStyle}>⚡</Animated.Text>
              <Text className="text-white font-bold text-sm">Mengupload Gambar...</Text>
              <Text className="text-xs text-gray-400">Gemini sedang memproses data</Text>
            </View>
          ) : (
            <View className="w-72 h-72 border-2 border-primary border-dashed rounded-[32px] items-center justify-center bg-black/10">
              <IconSymbol name="qrcode.viewfinder" size={48} color="rgba(255,255,255,0.5)" />
            </View>
          )}
        </View>
      </View>

      {/* Camera Controls Panel */}
      <View className="px-6 pb-12 pt-6 bg-black gap-6">
        <Text className="text-zinc-400 text-xs text-center leading-4 px-4">
          Arahkan kamera ke MPASI buatan sendiri atau makanan si kecil untuk mendeteksi bahan makanan, porsi, dan taksiran kalori secara instan.
        </Text>

        <View className="flex-row justify-around items-center">
          {/* Gallery Upload Option */}
          <Pressable onPress={handleGalleryPicker} disabled={isUploading} className="items-center gap-1">
            <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center active:scale-95">
              <IconSymbol name="photo.fill" size={20} color="#ffffff" />
            </View>
            <Text className="text-zinc-400 text-[10px] font-bold">Galeri</Text>
          </Pressable>

          {/* Shutter Button */}
          <Pressable
            onPress={handleCapture}
            disabled={isUploading}
            className="w-20 h-20 rounded-full border-4 border-white items-center justify-center p-1 active:scale-95"
          >
            <View className={`w-full h-full rounded-full ${isUploading ? 'bg-zinc-600' : 'bg-white'}`} />
          </Pressable>

          {/* Flash Toggle */}
          <Pressable onPress={toggleFlash} disabled={isUploading} className={`items-center gap-1 ${flash === 'off' ? 'opacity-50' : 'opacity-100'}`}>
            <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center">
              <IconSymbol name={flash === 'on' ? "bolt.fill" : "bolt.slash.fill"} size={20} color="#ffffff" />
            </View>
            <Text className="text-zinc-400 text-[10px] font-bold">Flash</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
