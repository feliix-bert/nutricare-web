import React from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = React.memo(({ icon = "📋", title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <View className="flex-1 items-center justify-center p-8 gap-3">
      <Text className="text-5xl mb-1">{icon}</Text>
      <Text className={cn("text-lg font-bold text-center text-gray-900")}>{title}</Text>
      {description && (
        <Text className={cn("text-sm text-center text-gray-500 max-w-[280px]")}>{description}</Text>
      )}
      {actionLabel && onAction ? (
        <Button onPress={onAction} variant="primary" size="md" className="mt-2 px-8">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
});
