import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
  <Card>
    <View className="flex-row items-center gap-4 px-4">
      <Text className="text-3xl">{icon}</Text>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-bold text-gray-900">{title}</Text>
        <Text className="text-xs text-gray-400">Tersedia di fase berikutnya</Text>
      </View>
      <View className="px-3 py-1 rounded-full bg-primary-light">
        <Text className="text-[10px] font-bold text-primary">Soon</Text>
      </View>
    </View>
  </Card>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-2">
    <Text className="text-sm text-gray-500">{label}</Text>
    <Text className="text-sm font-semibold text-gray-900">{value}</Text>
  </View>
);

export const ChildDetailScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? '');

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24 }} className="gap-4" showsVerticalScrollIndicator={false}>
        {/* Identity Card */}
        <Card pressable={false} className="items-center gap-4 py-8">
          <View className="w-24 h-24 rounded-full items-center justify-center bg-primary-light">
            <Text className="text-5xl">{child.gender === 'MALE' ? '👦' : '👧'}</Text>
          </View>
          <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">{child.name}</Text>
          <Text className="text-sm text-gray-500">{child.ageMonths} bulan</Text>
          {child.latestPrediction ? (
            <StatusBadge status={child.latestPrediction.status} />
          ) : (
            <Text className="text-xs text-gray-400">Belum ada assessment</Text>
          )}
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Anak</CardTitle>
          </CardHeader>
          <View className="h-px bg-gray-100 mx-4" />
          <CardContent className="gap-1">
            <InfoRow label="Tanggal Lahir" value={formatDate(child.birthDate)} />
            <InfoRow label="Jenis Kelamin" value={GENDER_LABEL[child.gender] ?? child.gender} />
            <InfoRow label="Usia" value={`${child.ageMonths} bulan`} />
          </CardContent>
        </Card>

        {/* Placeholder Sections for Future Phases */}
        <PlaceholderSection title="Riwayat Assessment" icon="📊" />
        <PlaceholderSection title="Log Gizi" icon="🍽️" />
        <PlaceholderSection title="Grafik Tumbuh Kembang" icon="📈" />
      </ScrollView>
    </SafeAreaView>
  );
};
