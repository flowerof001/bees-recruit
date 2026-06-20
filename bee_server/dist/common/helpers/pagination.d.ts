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
export declare function parsePagination(query: any): {
    skip: number;
    take: number;
    page: number;
    pageSize: number;
};
export declare function paginatedResult<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T>;
