export type Gender = 'MALE' | 'FEMALE';

export type StuntStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';

export type LatestPrediction = {
  status: StuntStatus;
  riskLevel?: number;
  createdAt: string;
};

export type Child = {
  id: string;
  name: string;
  birthDate: string;
  gender: Gender;
  ageMonths: number;
  /** Server juga return anonId, createdAt */
  anonId?: string;
  createdAt?: string;
  latestPrediction: LatestPrediction | null;
};

export type ChildDetail = Child & {
  assessments: Array<{
    id: string;
    weight: number;
    height: number;
    headCircumference?: number;
    bfExclusive?: boolean;
    mpasiAge?: number;
    mealFreq?: number;
    illnessHistory?: string;
    createdAt: string;
    prediction?: {
      id?: string;
      status: StuntStatus;
      predictionStatus?: 'COMPLETED' | 'PENDING' | 'FAILED';
      riskLevel: number;
      zscoreWa?: number;
      zscoreHa?: number;
      zscoreWh?: number;
      summary?: string;
      recommendations?: string[];
      nextAssessmentDate?: string;
      createdAt?: string;
    };
  }>;
};

export type ChildRequest = {
  name: string;
  birthDate: string;
  gender: Gender;
};

export type ChildUpdateRequest = {
  name: string;
  birthDate: string;
  gender?: Gender;
};
