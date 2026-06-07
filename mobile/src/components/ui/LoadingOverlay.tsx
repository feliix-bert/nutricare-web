import { ActivityIndicator, View } from 'react-native';

export const LoadingOverlay = () => {
  return (
    <View className="absolute inset-0 bg-black/35 items-center justify-center z-[999]">
      <View className="p-7 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    </View>
  );
};
