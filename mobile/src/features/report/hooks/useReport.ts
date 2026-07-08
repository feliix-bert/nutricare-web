import { useMutation } from '@tanstack/react-query';
import { reportService } from '../services/report-service';
import type { ReportRequest } from '../types/report-types';

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (request: ReportRequest) => reportService.generateReport(request),
  });
};
