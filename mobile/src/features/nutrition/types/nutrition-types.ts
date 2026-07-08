export type NutritionLog = {
  id: string;
  childId: string;
  photoUrl: string;
  foodDetected: string[];
  portionEstimate: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  adequacyNote: string;
  mpasiRecommendation: string;
  createdAt: string;
};

export type NutritionPhotoFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type NutritionUploadRequest = {
  childId: string;
  photo: NutritionPhotoFile;
};
