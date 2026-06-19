import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type GrowthDataPoint = {
  date: string;
  value: number;
  label: string;
  status: 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';
};

type GrowthChartProps = {
  data: GrowthDataPoint[];
  yAxisSuffix?: string;
  title: string;
};

const GrowthChart = React.memo(({ data, yAxisSuffix = ' kg', title }: GrowthChartProps) => {
  // Transform data for gifted-charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort chronological
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted.map((item, index) => {
      // Determine dot color based on status
      let dataPointColor = '#506444'; // NORMAL
      if (item.status === 'AT_RISK') dataPointColor = '#64601e';
      else if (item.status === 'STUNTED') dataPointColor = '#ba1a1a';
      else if (item.status === 'SEVERELY_STUNTED') dataPointColor = '#93000a';

      return {
        value: item.value,
        label: item.label,
        labelTextStyle: { color: '#717879', fontSize: 10, fontWeight: 'bold' as const },
        dataPointColor,
        // Only show label for every alternate point if many, or all if few
        showLabel: true,
      };
    });
  }, [data]);

  const latestValue = data[data.length - 1]?.value ?? 0;

  if (data.length < 2) {
    return (
      <Card className="p-6 items-center justify-center min-h-[220px] bg-surface-low border-dashed border-outline-variant/30">
        <View className="w-12 h-12 rounded-full bg-surface-lowest items-center justify-center mb-3">
          <IconSymbol name="chart.bar.fill" size={24} color="#717879" />
        </View>
        <Text className="font-bold text-on-surface text-center">Data Belum Cukup</Text>
        <Text className="text-xs text-outline text-center mt-1 max-w-[200px]">
          Lakukan minimal 2 kali assessment untuk melihat tren grafik pertumbuhan anak.
        </Text>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <View className="p-4 border-b border-surface-container flex-row justify-between items-center bg-surface-lowest">
        <Text className="font-bold text-sm text-on-surface">{title}</Text>
        <Text className="text-xs font-extrabold text-primary">{latestValue}{yAxisSuffix}</Text>
      </View>
      <View className="p-4 pt-6 bg-surface-lowest items-center">
        <LineChart
          data={chartData}
          height={160}
          width={280}
          spacing={60}
          initialSpacing={20}
          color="#3e646a"
          thickness={3}
          hideRules
          hideYAxisText
          yAxisColor="transparent"
          xAxisColor="#eae7e7"
          dataPointsHeight={10}
          dataPointsWidth={10}
          dataPointsRadius={5}
          textFontSize={10}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: '#3e646a',
            pointerStripWidth: 2,
            pointerColor: '#506444',
            radius: 6,
            pointerLabelWidth: 80,
            pointerLabelHeight: 30,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              return (
                <View className="bg-on-surface px-2 py-1 rounded-md">
                  <Text className="text-white text-[10px] font-bold text-center">
                    {items[0].value}{yAxisSuffix}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>
    </Card>
  );
});

GrowthChart.displayName = 'GrowthChart';

export { GrowthChart };
