export type ReportRequest = {
  childId: string;
  from?: string;
  to?: string;
};

export type ReportResponse = {
  url: string;
  generatedAt: string;
};
