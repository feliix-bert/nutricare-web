import React from 'react';
import { Text, View } from 'react-native';

import type { StuntStatus } from '@/features/children/types/child.types';

type StatusBadgeProps = {
  status: StuntStatus;
};

const STATUS_CONFIG: Record<
  StuntStatus,
  { label: string; containerClass: string; textClass: string }
> = {
  NORMAL: {
    label: 'Normal',
    containerClass: 'bg-success-light dark:bg-success-dark/20',
    textClass: 'text-success dark:text-success/90',
  },
  AT_RISK: {
    label: 'Berisiko',
    containerClass: 'bg-warning-light dark:bg-warning-dark/20',
    textClass: 'text-warning dark:text-warning/90',
  },
  STUNTED: {
    label: 'Stunting',
    containerClass: 'bg-danger-light dark:bg-danger-dark/20',
    textClass: 'text-danger dark:text-danger/90',
  },
  SEVERELY_STUNTED: {
    label: 'Stunting Berat',
    containerClass: 'bg-danger-light dark:bg-danger-dark/30',
    textClass: 'text-danger-dark dark:text-danger/95',
  },
};

export const StatusBadge = React.memo(({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${config.containerClass}`}>
      <Text className={`text-xs font-bold tracking-wide ${config.textClass}`}>
        {config.label}
      </Text>
    </View>
  );
});
