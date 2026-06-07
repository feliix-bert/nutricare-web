import React from 'react';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = React.memo(({
  icon = '📋',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <View className="flex-1 items-center justify-center p-8 gap-3">
      <Text className="text-5xl mb-1">{icon}</Text>
      <Text className="text-lg font-bold text-center text-gray-900 dark:text-gray-100">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-center text-gray-500 dark:text-gray-400 max-w-[280px]">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <AppButton onPress={onAction} variant="primary" size="md" className="mt-2 px-8">
          {actionLabel}
        </AppButton>
      )}
    </View>
  );
});
