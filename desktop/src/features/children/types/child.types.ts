export type Gender = 'MALE' | 'FEMALE';

export type StuntStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';

export type LatestPrediction = {
  status: StuntStatus;
  riskLevel: number;
  zscoreHa?: number | null;
};

export type Child = {
  id: string;
  name: string;
  birthDate: string;
  gender: Gender;
  ageMonths: number;
  latestPrediction: LatestPrediction | null;
  medicId?: string | null;
  medicName?: string | null;
};

export type ChildDetail = Child & {
  assessments: Array<{
    id: string;
    weight: number;
    height: number;
    createdAt: string;
    prediction: {
      status: StuntStatus;
      riskLevel: number;
      zscoreHa?: number | null;
      zscoreWa?: number | null;
      zscoreWh?: number | null;
      predictionStatus?: string;
    };
  }>;
};

export type ChildRequest = {
  name: string;
  birthDate: string;
  gender: Gender;
  medicId?: string | null;
};

export type ChildUpdateRequest = {
  name: string;
  birthDate: string;
};
