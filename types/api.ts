export type ApiEnvelope<T = unknown> = {
    success: boolean;
    message: string | string[];
    data: T;
};

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Paginated<T> {
    items: T[];
    meta: PaginationMeta;
}