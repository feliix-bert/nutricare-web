import { delay, USE_MOCK, getMockReportUrl } from '@/services/mock';
import type { ReportRequest } from '../types/report.types';

export const reportService = {
  generateReport: async (request: ReportRequest): Promise<string> => {
    if (USE_MOCK) {
      await delay(800);
      return getMockReportUrl(request.childId, request.from, request.to);
    }
    const params = new URLSearchParams();
    if (request.from) params.set('from', request.from);
    if (request.to) params.set('to', request.to);
    const qs = params.toString();
    const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
    return `${baseUrl}/api/reports/child/${request.childId}${qs ? `?${qs}` : ''}`;
  },
};
