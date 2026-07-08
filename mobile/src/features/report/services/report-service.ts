import type { ReportRequest } from '../types/report-types';

export const reportService = {
  generateReport: async (request: ReportRequest): Promise<string> => {
    const params = new URLSearchParams();
    if (request.from) params.set('from', request.from);
    if (request.to) params.set('to', request.to);
    const qs = params.toString();
    const baseUrl = process.env.EXPO_PUBLIC_NEXTJS_API_URL ?? 'http://localhost:3000';
    return `${baseUrl}/api/reports/child/${request.childId}${qs ? `?${qs}` : ''}`;
  },
};
