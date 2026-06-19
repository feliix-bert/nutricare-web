import React from 'react';
import { Text, View } from 'react-native';

import { StatusBadge } from '@/components/common/StatusBadge';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ZScoreBadge } from '@/features/assessment/components/ZScoreBadge';
import type { AssessmentPredictionDTO } from '@/features/assessment/types/assessment.types';

const PredictionCard = React.memo(({ prediction }: { prediction: AssessmentPredictionDTO }) => {
  const isPending = prediction.predictionStatus === 'PENDING';
  const isFailed = prediction.predictionStatus === 'FAILED';

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
            <IconSymbol name="chart.bar.fill" size={18} color="#3e646a" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-on-surface text-sm">Hasil Interpretasi AI</Text>
            <Text className="text-xs text-outline font-medium mt-0.5">
              {isPending ? 'Prediksi sedang diproses...' : isFailed ? 'Prediksi gagal diproses' : 'Prediksi selesai'}
            </Text>
          </View>
        </View>
        {!isPending && !isFailed ? <StatusBadge status={prediction.status} /> : null}
      </View>

      {!isPending && !isFailed ? (
        <>
          <Text className="text-xs text-on-surface leading-5 font-semibold">
            {prediction.summary}
          </Text>
          <View className="flex-row gap-2">
            <ZScoreBadge label="WAZ" value={prediction.zscoreWa} helper="BB/U" />
            <ZScoreBadge label="HAZ" value={prediction.zscoreHa} helper="TB/U" />
            <ZScoreBadge label="WHZ" value={prediction.zscoreWh} helper="BB/TB" />
          </View>
          <View className="gap-2 pt-2 border-t border-surface-container">
            {prediction.recommendations.map((item, index) => (
              <View key={`${item}-${index}`} className="flex-row gap-2 items-start">
                <Text className="text-secondary font-bold">•</Text>
                <Text className="text-xs text-on-surface leading-4 flex-1">{item}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Card>
  );
});

PredictionCard.displayName = 'PredictionCard';

export { PredictionCard };
