export type GeminiPredictRequest = {
  assessmentId: string;
};

export type GeminiPredictResponse = {
  predictionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
};

export type GeminiNutritionRequest = {
  childId: string;
  photoUrl: string;
};

export type GeminiNutritionResponse = {
  foodDetected: string[];
  portionEstimate: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  adequacyNote: string;
  mpasiRecommendation: string;
};
