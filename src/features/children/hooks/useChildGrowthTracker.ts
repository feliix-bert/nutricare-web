import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChild } from "./useChildren";
import { useVaultStore } from "@/stores/vaultStore";

export const useChildGrowthTracker = (childId: string) => {
  const router = useRouter();
  const { data: child, isLoading } = useChild(childId);
  const vaultRecords = useVaultStore((s) => s.records);
  const [activeCategory, setActiveCategory] = useState<"weight_age" | "height_age" | "weight_height">("weight_age");

  const childHistory = child ? vaultRecords.filter((r) => r.childId === child.id) : [];

  const handleStartAssessment = () => {
    if (child) {
      router.push(`/children/${child.id}/assessment/body-size`);
    }
  };

  const getChartCoordinates = (category: typeof activeCategory) => {
    const xCoords = [25, 85, 145, 205, 265];

    if (category === "weight_age") {
      return {
        unit: "kg",
        currentVal: "8.4",
        label: "Current Weight",
        who: [
          { x: xCoords[0], y: 40 },
          { x: xCoords[1], y: 60 },
          { x: xCoords[2], y: 80 },
          { x: xCoords[3], y: 95 },
          { x: xCoords[4], y: 108 },
        ],
        child: [
          { x: xCoords[0], y: 28 },
          { x: xCoords[1], y: 48 },
          { x: xCoords[2], y: 80 },
          { x: xCoords[3], y: 92 },
          { x: xCoords[4], y: 100 },
        ],
        target: "8.8 kg",
        percentile: "75th",
      };
    } else if (category === "height_age") {
      return {
        unit: "cm",
        currentVal: "72.0",
        label: "Current Height",
        who: [
          { x: xCoords[0], y: 35 },
          { x: xCoords[1], y: 55 },
          { x: xCoords[2], y: 75 },
          { x: xCoords[3], y: 92 },
          { x: xCoords[4], y: 105 },
        ],
        child: [
          { x: xCoords[0], y: 25 },
          { x: xCoords[1], y: 42 },
          { x: xCoords[2], y: 72 },
          { x: xCoords[3], y: 85 },
          { x: xCoords[4], y: 94 },
        ],
        target: "75.5 cm",
        percentile: "60th",
      };
    } else {
      return {
        unit: "ratio",
        currentVal: "1.25",
        label: "Weight/Height Ratio",
        who: [
          { x: xCoords[0], y: 38 },
          { x: xCoords[1], y: 58 },
          { x: xCoords[2], y: 78 },
          { x: xCoords[3], y: 94 },
          { x: xCoords[4], y: 106 },
        ],
        child: [
          { x: xCoords[0], y: 30 },
          { x: xCoords[1], y: 50 },
          { x: xCoords[2], y: 78 },
          { x: xCoords[3], y: 90 },
          { x: xCoords[4], y: 98 },
        ],
        target: "1.35",
        percentile: "70th",
      };
    }
  };

  const chartData = getChartCoordinates(activeCategory);

  return {
    child,
    isLoading,
    childHistory,
    activeCategory,
    setActiveCategory,
    chartData,
    handleStartAssessment,
  };
};
