export interface ApiResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}