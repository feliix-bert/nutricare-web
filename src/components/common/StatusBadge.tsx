import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { StuntStatus } from "@/features/children/types/child.types";

type StatusBadgeProps = {
  status: StuntStatus;
};

const STATUS_CONFIG: Record<StuntStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; pulse?: boolean }> = {
  NORMAL: {
    label: "Normal",
    variant: "success",
  },
  AT_RISK: {
    label: "Berisiko",
    variant: "warning",
    pulse: true,
  },
  STUNTED: {
    label: "Stunting",
    variant: "destructive",
    pulse: true,
  },
  SEVERELY_STUNTED: {
    label: "Stunting Berat",
    variant: "destructive",
    pulse: true,
  },
};

const StatusBadge = React.memo(({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} pulse={config.pulse}>{config.label}</Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
