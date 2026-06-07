import { ActivityIndicator, View } from "react-native";

export const LoadingOverlay = () => {
  return (
    <View className="absolute inset-0 bg-black/35 items-center justify-center z-[999]">
      <View className="p-7 rounded-2xl bg-white">
        <ActivityIndicator size="large" color="#0A7E6E" />
      </View>
    </View>
  );
};
