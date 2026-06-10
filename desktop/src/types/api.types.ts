export type ApiError = {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
};

export type PageResponse<T> = {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
