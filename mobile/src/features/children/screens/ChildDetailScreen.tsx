import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChildGrowthTracker } from '@/features/children/hooks/useChildGrowthTracker';

const RenderLine = ({
  x1,
  y1,
  x2,
  y2,
  color,
  thickness = 3,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness?: number;
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const centerX = x1 + dx / 2;
  const centerY = y1 + dy / 2;
  return (
    <View
      style={{
        position: 'absolute',
        left: centerX - distance / 2,
        bottom: centerY,
        width: distance,
        height: thickness,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
};

export const ChildDetailScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const {
    child,
    isLoading,
    activeCategory,
    setActiveCategory,
    chartData,
    handleStartAssessment,
  } = useChildGrowthTracker(childId ?? '');

  if (isLoading) return <LoadingOverlay />;
  if (!child) return null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10">
            <IconSymbol name="chevron.left" size={20} color="#3e646a" />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDNo7cQUNctrRjKfFyO0beDmlnMVuCR58pAdnHNOg0TG8G0jxun6sTPVqx-rvzgSg_vL6PxecUjBwCQZafL9hBtPvbRVhfoaHqQ8YxhDxXeEI-R5JP42AamTjvAZ4K6VwnRIiKdZOeIE9CWARiMntbtlP-XYTAWDrccYD4e6yT0SkFe8jiYXX1uP9TQf1DLTjIye4fRmJCApiD7ycO1sionPND39QIFLDPBcjRlfxREqzFD5KEXLZJc_wROSafiBQcXDhNl3wrAqA',
              }}
              className="w-8 h-8 rounded-full"
            />
            <Text className="text-base font-extrabold text-on-surface tracking-tight">GiziChain</Text>
          </View>
        </View>
        <Pressable className="w-10 h-10 rounded-full bg-surface-low items-center justify-center border border-outline-variant/10">
          <IconSymbol name="bell" size={18} color="#3e646a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="gap-1.5 mt-2">
          <Text className="text-[26px] font-extrabold text-on-surface tracking-tight">Growth Tracker</Text>
          <Text className="text-sm text-outline font-medium leading-5">
            Monitoring your baby’s development against WHO standards.
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
          <Pressable
            onPress={() => setActiveCategory('weight_height')}
            className={`px-4 py-2 rounded-full ${
              activeCategory === 'weight_height' ? 'bg-primary-container shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${activeCategory === 'weight_height' ? 'text-on-surface' : 'text-outline'}`}>
              Berat/Tinggi
            </Text>
          </Pressable>
        </View>

        {/* Current Metric Card */}
        <Card className="p-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-[10px] text-outline font-extrabold tracking-wider uppercase">{chartData.label}</Text>
              <Text className="text-3xl font-extrabold text-on-surface mt-1">
                {chartData.currentVal} <Text className="text-sm font-bold text-outline">{chartData.unit}</Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-1 px-3.5 py-2 rounded-full bg-secondary-container/45">
              <Text className="text-xs">📈</Text>
              <Text className="text-[11px] font-extrabold text-secondary">Normal Growth</Text>
            </View>
          </View>

          {/* Styled WHO Curve Graph */}
          <View className="h-48 bg-surface-low rounded-[24px] p-4 relative justify-end border border-outline-variant/10 overflow-hidden">
            {/* Grid Lines */}
            <View className="absolute inset-0 justify-between py-6 px-4 pointer-events-none opacity-40">
              <View className="h-px bg-outline-variant/30 w-full" />
              <View className="h-px bg-outline-variant/30 w-full" />
              <View className="h-px bg-outline-variant/30 w-full" />
            </View>

            {/* WHO Median Curve (Drawn in light green/teal) */}
            <RenderLine x1={chartData.who[0].x} y1={chartData.who[0].y} x2={chartData.who[1].x} y2={chartData.who[1].y} color="#a6cbc7" thickness={2.5} />
            <RenderLine x1={chartData.who[1].x} y1={chartData.who[1].y} x2={chartData.who[2].x} y2={chartData.who[2].y} color="#a6cbc7" thickness={2.5} />
            <RenderLine x1={chartData.who[2].x} y1={chartData.who[2].y} x2={chartData.who[3].x} y2={chartData.who[3].y} color="#a6cbc7" thickness={2.5} />
            <RenderLine x1={chartData.who[3].x} y1={chartData.who[3].y} x2={chartData.who[4].x} y2={chartData.who[4].y} color="#a6cbc7" thickness={2.5} />

            {/* Child actual growth line (Drawn in primary Teal) */}
            <RenderLine x1={chartData.child[0].x} y1={chartData.child[0].y} x2={chartData.child[1].x} y2={chartData.child[1].y} color="#3e646a" thickness={3.5} />
            <RenderLine x1={chartData.child[1].x} y1={chartData.child[1].y} x2={chartData.child[2].x} y2={chartData.child[2].y} color="#3e646a" thickness={3.5} />
            <RenderLine x1={chartData.child[2].x} y1={chartData.child[2].y} x2={chartData.child[3].x} y2={chartData.child[3].y} color="#3e646a" thickness={3.5} />
            <RenderLine x1={chartData.child[3].x} y1={chartData.child[3].y} x2={chartData.child[4].x} y2={chartData.child[4].y} color="#3e646a" thickness={3.5} />

            {/* Plotted Dots */}
            {chartData.child.map((pt, idx) => {
              const isLatest = idx === chartData.child.length - 1;
              return (
                <View
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: pt.x - 7,
                    bottom: pt.y - 7,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: isLatest ? '#3e646a' : '#ffffff',
                    borderWidth: 2.5,
                    borderColor: '#3e646a',
                    zIndex: 30,
                  }}
                />
              );
            })}

            {/* Plotted WHO Guide Dots (Empty Circles) */}
            {chartData.who.map((pt, idx) => (
              <View
                key={`who-${idx}`}
                style={{
                  position: 'absolute',
                  left: pt.x - 4,
                  bottom: pt.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#ffffff',
                  borderWidth: 1.5,
                  borderColor: '#a6cbc7',
                  zIndex: 20,
                  opacity: 0.8,
                }}
              />
            ))}

            {/* Reference labels overlay */}
            <Text className="absolute right-4 top-4 text-[9px] text-outline font-bold opacity-60">+2 SD (High)</Text>
            <Text className="absolute right-4 top-1/2 text-[9px] text-outline font-bold opacity-60">Median</Text>
            <Text className="absolute right-4 bottom-8 text-[9px] text-error font-bold opacity-60">-2 SD (Low)</Text>

            {/* Bottom X-axis label */}
            <View className="absolute left-0 right-0 bottom-1 flex-row justify-between px-6">
              <Text className="text-[9px] text-outline font-bold">4m</Text>
              <Text className="text-[9px] text-outline font-bold">5m</Text>
              <Text className="text-[9px] text-outline font-bold">6m</Text>
              <Text className="text-[9px] text-outline font-bold">7m</Text>
              <Text className="text-[9px] text-outline font-bold">8m</Text>
            </View>
          </View>
        </Card>

        {/* Indicators Grid */}
        <View className="flex-row gap-4">
          {/* Target Card */}
          <View className="flex-1 bg-primary-container/40 border border-outline-variant/10 rounded-[32px] p-5">
            <View className="w-9 h-9 rounded-full bg-primary-container items-center justify-center mb-3">
              <IconSymbol name="shield.fill" size={16} color="#3e646a" />
            </View>
            <Text className="text-[10px] text-outline font-bold leading-3">Target</Text>
            <Text className="text-base font-extrabold text-on-surface mt-1">{chartData.target}</Text>
            <Text className="text-[10px] text-outline font-medium mt-0.5">by next month</Text>
          </View>

          {/* Percentile Card */}
          <View className="flex-1 bg-secondary-container/30 border border-outline-variant/10 rounded-[32px] p-5">
            <View className="w-9 h-9 rounded-full bg-secondary-container/70 items-center justify-center mb-3">
              <IconSymbol name="chart.bar.fill" size={16} color="#506444" />
            </View>
            <Text className="text-[10px] text-outline font-bold leading-3">Percentile</Text>
            <Text className="text-base font-extrabold text-on-surface mt-1">{chartData.percentile}</Text>
            <Text className="text-[10px] text-outline font-medium mt-0.5">above median</Text>
          </View>
        </View>

        {/* Blockchain Verified Card */}
        <Pressable className="flex-row justify-between items-center p-5 bg-surface-low border border-outline-variant/10 rounded-[32px]">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
              <IconSymbol name="checkmark.circle.fill" size={18} color="#3e646a" />
            </View>
            <View>
              <Text className="text-sm font-extrabold text-on-surface">Blockchain Verified</Text>
              <Text className="text-xs text-outline mt-0.5">Data integrity secured via GiziChain</Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={16} color="#717879" />
        </Pressable>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={handleStartAssessment}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg active:scale-95"
      >
        <Text className="text-white text-2xl font-bold leading-7">+</Text>
      </Pressable>
    </SafeAreaView>
  );
};
