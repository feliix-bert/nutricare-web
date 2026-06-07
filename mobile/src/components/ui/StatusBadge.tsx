import React from "react";
import { Text, View } from "react-native";

import type { StuntStatus } from "@/features/children/types/child.types";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

type StatusBadgeProps = {
  status: StuntStatus;
};

const STATUS_CONFIG: Record<StuntStatus, { label: string; containerClass: string; textClass: string }> = {
  NORMAL: {
    label: "Normal",
    containerClass: "bg-success-light",
    textClass: "text-success",
  },
  AT_RISK: {
    label: "Berisiko",
    containerClass: "bg-warning-light",
    textClass: "text-warning",
  },
  STUNTED: {
    label: "Stunting",
    containerClass: "bg-danger-light",
    textClass: "text-danger",
  },
  SEVERELY_STUNTED: {
    label: "Stunting Berat",
    containerClass: "bg-danger-light",
    textClass: "text-danger-dark",
  },
};

export const StatusBadge = React.memo(({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <View className={cn("px-3 py-1.5 rounded-full self-start", config.containerClass)}>
      <Text className={cn("text-xs font-bold tracking-wide", config.textClass)}>{config.label}</Text>
    </View>
  );
});
