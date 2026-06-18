export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function parsePagination(query: any): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function paginatedResult<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
