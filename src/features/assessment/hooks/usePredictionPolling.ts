import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { StuntEnum, PredStatusEnum } from "@/types/supabase";

export type PredictionResult = {
  id: string;
  assessmentId: string;
  stuntStatus: StuntEnum;
  predictionStatus: PredStatusEnum;
  zscoreWa: number | null;
  zscoreHa: number | null;
  zscoreWh: number | null;
  riskLevel: number | null;
  summary: string | null;
  recommendations: string[];
  nextAssessmentDate: string | null;
  disclaimer: string;
};

export const predictionQueryKey = (assessmentId: string) =>
  ["prediction", "poll", assessmentId] as const;

/**
 * Poll prediction status by assessmentId.
 * Auto-refresh every 2s while PENDING, stop on COMPLETED/FAILED.
 */
export const usePredictionPolling = (
  assessmentId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: predictionQueryKey(assessmentId ?? ""),
    queryFn: async (): Promise<PredictionResult> => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("predictions")
        .select(
          `
          id,
          assessment_id,
          stunt_status,
          prediction_status,
          zscore_wa,
          zscore_ha,
          zscore_wh,
          risk_level,
          summary,
          recommendations,
          next_assessment_date,
          disclaimer
        `,
        )
        .eq("assessment_id", assessmentId!)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Prediction not found");

      return {
        id: data.id,
        assessmentId: data.assessment_id,
        stuntStatus: data.stunt_status,
        predictionStatus: data.prediction_status,
        zscoreWa: data.zscore_wa,
        zscoreHa: data.zscore_ha,
        zscoreWh: data.zscore_wh,
        riskLevel: data.risk_level,
        summary: data.summary,
        recommendations: (data.recommendations as string[]) ?? [],
        nextAssessmentDate: data.next_assessment_date,
        disclaimer: data.disclaimer,
      };
    },
    enabled: enabled && !!assessmentId,
    // Poll every 2s while PENDING
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.predictionStatus === "PENDING") return 2000;
      return false; // Stop polling on COMPLETED/FAILED
    },
    staleTime: 0,
  });
