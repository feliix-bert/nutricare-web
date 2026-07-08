import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FoodTagList } from '@/features/nutrition/components/FoodTagList';
import type { NutritionLog } from '@/features/nutrition/types/nutrition-types';
import { formatTime } from '@/utils/format';

type NutritionCardProps = {
  log: NutritionLog;
  onDelete?: (id: string) => void;
};

const deleteIconStyle = { transform: [{ rotate: '45deg' }] };

const NutritionCard = React.memo(({ log, onDelete }: NutritionCardProps) => (
  <Card className="p-4 gap-3">
    <View className="flex-row gap-3">
      <View className="w-16 h-16 rounded-[20px] overflow-hidden border border-outline-variant/20 bg-primary-light">
        {log.photoUrl ? (
          <Image source={{ uri: log.photoUrl }} className="w-full h-full" contentFit="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <IconSymbol name="fork.knife" size={22} color="#3e646a" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="font-bold text-on-surface text-sm flex-1" numberOfLines={1}>
            {log.foodDetected.join(', ')}
          </Text>
          <Text className="text-[10px] text-outline font-bold">{formatTime(log.createdAt)}</Text>
        </View>
        <Text className="text-[10px] text-primary font-bold mt-0.5" numberOfLines={1}>
          {log.portionEstimate}
        </Text>
        <Text className="text-[11px] text-outline mt-1 font-semibold">
          {log.calories} kkal • P: {log.protein}g • L: {log.fat}g • K: {log.carbs}g • S: {log.fiber}g
        </Text>
      </View>
      {onDelete ? (
        <Pressable onPress={() => onDelete(log.id)} className="p-1.5 rounded-full active:scale-95">
          <IconSymbol name="plus" size={18} color="#ba1a1a" style={deleteIconStyle} />
        </Pressable>
      ) : null}
    </View>

    <FoodTagList items={log.foodDetected} />

    <View className="bg-surface-low rounded-[20px] p-3 gap-1">
      <Text className="text-[10px] text-outline font-bold uppercase tracking-wider">Catatan AI</Text>
      <Text className="text-xs text-on-surface leading-4 font-semibold">{log.adequacyNote}</Text>
      <Text className="text-xs text-primary leading-4 font-bold">{log.mpasiRecommendation}</Text>
    </View>
  </Card>
));

NutritionCard.displayName = 'NutritionCard';

export { NutritionCard };
