import React from 'react';
import { Text, View } from 'react-native';

import { StatusBadge } from '@/components/common/StatusBadge';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { AssessmentResponseDTO } from '@/features/assessment/types/assessment.types';
import { formatTime } from '@/utils/format';

type AssessmentCardProps = {
  assessment: AssessmentResponseDTO;
  onPress?: () => void;
};

const AssessmentCard = React.memo(({ assessment, onPress }: AssessmentCardProps) => (
  <Card pressable={!!onPress} onPress={onPress} className="p-4 gap-3">
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
          <IconSymbol name="chart.bar.fill" size={18} color="#506444" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-on-surface text-sm">{assessment.child.name}</Text>
          <Text className="text-xs text-outline font-medium mt-0.5">
            {assessment.child.ageMonths} bulan • {formatTime(assessment.createdAt)}
          </Text>
        </View>
      </View>
      <StatusBadge status={assessment.prediction.status} />
    </View>

    <View className="flex-row justify-between items-center bg-surface-low p-3 rounded-[20px]">
      <View className="items-center flex-1">
        <Text className="text-[10px] text-outline font-bold">Berat</Text>
        <Text className="text-xs text-on-surface font-extrabold mt-0.5">{assessment.weight} kg</Text>
      </View>
      <View className="w-px h-8 bg-outline-variant/35" />
      <View className="items-center flex-1">
        <Text className="text-[10px] text-outline font-bold">Tinggi</Text>
        <Text className="text-xs text-on-surface font-extrabold mt-0.5">{assessment.height} cm</Text>
      </View>
      <View className="w-px h-8 bg-outline-variant/35" />
      <View className="items-center flex-1">
        <Text className="text-[10px] text-outline font-bold">Risiko</Text>
        <Text className="text-xs text-on-surface font-extrabold mt-0.5">Level {assessment.prediction.riskLevel}</Text>
      </View>
    </View>
  </Card>
));

AssessmentCard.displayName = 'AssessmentCard';

export { AssessmentCard };
