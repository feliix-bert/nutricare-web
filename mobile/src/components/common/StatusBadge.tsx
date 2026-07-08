import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { StuntStatus } from "@/features/children/types/child-types";

type StatusBadgeProps = {
  status: StuntStatus;
};

const STATUS_CONFIG: Record<StuntStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" }> = {
  NORMAL: {
    label: "Normal",
    variant: "secondary",
  },
  AT_RISK: {
    label: "Berisiko",
    variant: "outline",
  },
  STUNTED: {
    label: "Stunting",
    variant: "destructive",
  },
  SEVERELY_STUNTED: {
    label: "Stunting Berat",
    variant: "destructive",
  },
};

const StatusBadge = React.memo(({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant}>{config.label}</Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
