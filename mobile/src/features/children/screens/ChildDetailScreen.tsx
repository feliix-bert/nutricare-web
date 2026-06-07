import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '@/components/ui/AppCard';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useChild } from '@/features/children/hooks/useChildren';

const GENDER_LABEL: Record<string, string> = {
  MALE: '👦 Laki-laki',
  FEMALE: '👧 Perempuan',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const PlaceholderSection = ({ title, icon }: { title: string; icon: string }) => (
  <AppCard pressable={false}>
    <View className="flex-row items-center gap-3">
      <Text className="text-3xl">{icon}</Text>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">Tersedia di fase berikutnya</Text>
      </View>
      <View className="px-2.5 py-1 rounded-full bg-primary-light dark:bg-primary-dark/20">
        <Text className="text-[10px] font-bold text-primary dark:text-primary-light">Soon</Text>
      </View>
    </View>
  </AppCard>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-1">
    <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</Text>
  </View>
);

export const ChildDetailScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? '');

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24 }} className="gap-4" showsVerticalScrollIndicator={false}>
        {/* Identity Card */}
        <AppCard pressable={false} className="items-center gap-3 py-6">
          <View className="w-22 h-22 rounded-full items-center justify-center bg-primary-light dark:bg-primary-dark/20">
            <Text className="text-4xl">{child.gender === 'MALE' ? '👦' : '👧'}</Text>
          </View>

          <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{child.name}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{child.ageMonths} bulan</Text>

          {child.latestPrediction ? (
            <StatusBadge status={child.latestPrediction.status} />
          ) : (
            <Text className="text-xs text-gray-500 dark:text-gray-400">Belum ada assessment</Text>
          )}
        </AppCard>

        {/* Info Section */}
        <AppCard pressable={false} className="gap-3">
          <Text className="text-base font-bold text-gray-900 dark:text-gray-100">Informasi Anak</Text>
          <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />

          <InfoRow label="Tanggal Lahir" value={formatDate(child.birthDate)} />
          <InfoRow label="Jenis Kelamin" value={GENDER_LABEL[child.gender] ?? child.gender} />
          <InfoRow label="Usia" value={`${child.ageMonths} bulan`} />
        </AppCard>

        {/* Placeholder Sections for Future Phases */}
        <PlaceholderSection title="Riwayat Assessment" icon="📊" />
        <PlaceholderSection title="Log Gizi" icon="🍽️" />
        <PlaceholderSection title="Grafik Tumbuh Kembang" icon="📈" />
      </ScrollView>
    </SafeAreaView>
  );
};
