import { createClient } from "@/lib/supabase/client";
import type { AssessmentRequestDTO, AssessmentResponseDTO } from "@/features/assessment/types/assessment.types";

export const assessmentService = {
  createAssessment: async (data: AssessmentRequestDTO): Promise<AssessmentResponseDTO> => {
    const supabase = createClient();

    // 1. Insert assessment
    const { data: assessment, error } = await supabase
      .from("assessments")
      .insert({
        child_id: data.childId,
        weight: data.weight,
        height: data.height,
        head_circumference: data.headCircumference,
        bf_exclusive: data.bfExclusive,
        mpasi_age: data.mpasiAge,
        meal_freq: data.mealFreq,
        illness_history: data.illnessHistory,
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Create pending prediction
    const { data: prediction, error: predError } = await supabase
      .from("predictions")
      .insert({
        assessment_id: assessment.id,
        prediction_status: "PENDING",
      })
      .select()
      .single();

    if (predError) throw predError;

    // 3. Trigger Gemini prediction via Next.js API (fire & forget)
    // The API route will update the prediction and blockchain anchor
    fetch(`/api/gemini/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId: assessment.id }),
    }).catch(() => {
      console.error("[assessment] Failed to trigger Gemini prediction");
    });

    // 4. Return immediate response with PENDING prediction
    return {
      id: assessment.id,
      child: {
        id: data.childId,
        name: "",
        ageMonths: 0,
      },
      weight: assessment.weight,
      height: assessment.height,
      headCircumference: assessment.head_circumference ?? 0,
      bfExclusive: assessment.bf_exclusive,
      mpasiAge: assessment.mpasi_age ?? 0,
      mealFreq: assessment.meal_freq ?? 0,
      illnessHistory: assessment.illness_history ?? "",
      createdAt: assessment.created_at,
      prediction: {
        id: prediction.id,
        status: "NORMAL",
        predictionStatus: "PENDING",
        zscoreWa: 0,
        zscoreHa: 0,
        zscoreWh: 0,
        riskLevel: 0,
        summary: "",
        recommendations: [],
        nextAssessmentDate: "",
        disclaimer: "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.",
      },
      blockchain: {
        id: "",
        anchored: false,
        recordHash: "",
        txHash: "",
        blockNumber: 0,
        anchorStatus: "PENDING",
        explorerUrl: "",
        verifyUrl: "",
      },
    };
  },
};
