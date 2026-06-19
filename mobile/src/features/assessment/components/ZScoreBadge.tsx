import React from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type ZScoreBadgeProps = {
  label: string;
  value: number | string;
  helper?: string;
};

const getToneClass = (score: number) => {
  if (score < -3) return { container: 'bg-danger/10 border-danger/25', text: 'text-danger-dark' };
  if (score < -2) return { container: 'bg-danger/5 border-danger/20', text: 'text-danger' };
  if (score < -1) return { container: 'bg-tertiary/5 border-tertiary/20', text: 'text-tertiary' };
  return { container: 'bg-secondary/5 border-secondary/20', text: 'text-secondary' };
};

const ZScoreBadge = React.memo(({ label, value, helper }: ZScoreBadgeProps) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  const tone = Number.isFinite(numericValue)
    ? getToneClass(numericValue)
    : { container: 'bg-surface-low border-outline-variant/20', text: 'text-outline' };

  return (
    <View className={cn('flex-1 rounded-[20px] border p-3 items-center', tone.container)}>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-outline">
        {label}
      </Text>
      <Text className={cn('text-base font-extrabold mt-1', tone.text)}>
        {Number.isFinite(numericValue) ? numericValue.toFixed(1) : value} SD
      </Text>
      {helper ? <Text className="text-[10px] text-outline mt-0.5">{helper}</Text> : null}
    </View>
  );
});

ZScoreBadge.displayName = 'ZScoreBadge';

export { ZScoreBadge };
