import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChild } from '@/features/children/hooks/useChildren';
import { useChildAssessments } from '@/features/assessment/hooks/useAssessment';
import { GrowthChart, type GrowthDataPoint } from '@/features/children/components/GrowthChart';
import { useVcStatus, VcStatusCard } from '@/features/vc';

export const ChildDetailScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const [activeCategory, setActiveCategory] = useState<'weight_age' | 'height_age'>('weight_age');

  const { data: child, isLoading: isChildLoading } = useChild(childId ?? '');
  const { data: assessmentsData, isLoading: isAssessmentsLoading } = useChildAssessments(childId ?? '', 0, 50);
  const { vc, hasActiveVc, isLoading: isVcLoading } = useVcStatus(childId ?? '');

  const assessments = useMemo(() => {
    return assessmentsData?.data ?? [];
  }, [assessmentsData]);

  const chartData: GrowthDataPoint[] = useMemo(() => {
    return assessments
      .filter((a) => a.prediction.predictionStatus === 'COMPLETED')
      .map((a) => {
        const dateObj = new Date(a.createdAt);
        const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const monthShort = MONTHS_ID[dateObj.getMonth()];
        const label = `${dateObj.getDate()} ${monthShort}`;

        return {
          date: a.createdAt,
          value: activeCategory === 'weight_age' ? (a.weight ?? 0) : (a.height ?? 0),
          label,
          status: a.prediction.status,
        };
      });
  }, [assessments, activeCategory]);

  const handleStartAssessment = () => {
    router.push(`/(app)/children/${childId}/assessment/body-size`);
  };

  if (isChildLoading) return <LoadingOverlay />;
  if (!child) return null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-surface-container">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10">
            <IconSymbol name="chevron.left" size={20} color="#3e646a" />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">{child.gender === 'MALE' ? '👦' : '👧'}</Text>
            <View>
              <Text className="text-base font-extrabold text-on-surface tracking-tight">{child.name}</Text>
              <Text className="text-xs text-outline">{child.ageMonths} Bulan</Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => router.push(`/(app)/children/${child.id}/edit`)}
          className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10"
        >
          <IconSymbol name="person.fill" size={18} color="#3e646a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="gap-1.5 mt-2">
          <Text className="text-[26px] font-extrabold text-on-surface tracking-tight">Growth Tracker</Text>
          <Text className="text-sm text-outline font-medium leading-5">
            Pantau perkembangan {child.name} berdasarkan standar kurva WHO.
          </Text>
        </View>

        {/* Category Selector Tabs */}
        <View className="flex-row bg-surface-low p-1 rounded-full border border-outline-variant/10 self-start my-2">
          <Pressable
            onPress={() => setActiveCategory('weight_age')}
            className={`px-4 py-2 rounded-full ${
              activeCategory === 'weight_age' ? 'bg-primary-container shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${activeCategory === 'weight_age' ? 'text-on-surface' : 'text-outline'}`}>
              Berat/Umur
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveCategory('height_age')}
            className={`px-4 py-2 rounded-full ${
              activeCategory === 'height_age' ? 'bg-primary-container shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${activeCategory === 'height_age' ? 'text-on-surface' : 'text-outline'}`}>
              Tinggi/Umur
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Growth Chart Component */}
        <View className="mb-2 mt-2">
          {isAssessmentsLoading ? (
            <Card className="p-6 items-center justify-center min-h-[220px]">
              <LoadingOverlay />
            </Card>
          ) : (
            <GrowthChart
              data={chartData}
              title={activeCategory === 'weight_age' ? 'Grafik Berat Badan' : 'Grafik Tinggi/Panjang'}
              yAxisSuffix={activeCategory === 'weight_age' ? ' kg' : ' cm'}
            />
          )}
        </View>

        {/* Info */}
        <View className="flex-row items-center gap-2 p-4 bg-primary/5 border border-primary/10 rounded-[20px]">
          <IconSymbol name="info.circle" size={16} color="#3e646a" />
          <Text className="text-xs font-semibold text-primary flex-1">
            Data didasarkan pada perhitungan z-score WHO standar deviasi -2 hingga +2.
          </Text>
        </View>

        {/* Verifiable Credential Status */}
        {!isVcLoading && (
          <View className="gap-2">
            <Text className="text-xs font-bold text-outline uppercase tracking-wider">Status Credential</Text>
            <VcStatusCard
              vc={vc}
              hasActiveVc={hasActiveVc}
              onViewDetails={() => {
                if (vc) {
                  router.push(`/(app)/vc/${vc.id}` as any);
                }
              }}
            />
          </View>
        )}

        {/* Action Button */}
        <Button onPress={handleStartAssessment} variant="primary" className="mb-4">
          Catat Assessment Baru
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
