export type Gender = 'MALE' | 'FEMALE';

export type StuntStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';

export type LatestPrediction = {
  status: StuntStatus;
  createdAt: string;
};

export type Child = {
  id: string;
  name: string;
  birthDate: string;
  gender: Gender;
  ageMonths: number;
  latestPrediction: LatestPrediction | null;
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
};
