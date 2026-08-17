import type { Paginated } from "@/types/api";

import api from "./api";

export const fetchTransactions = async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
    from?: string;
    to?: string;
} = {}) => {
    return api.get<Paginated<unknown>>("/admin/financial/transactions", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            type: params.type || undefined,
            status: params.status || undefined,
            userId: params.userId || undefined,
            from: params.from || undefined,
            to: params.to || undefined,
        },
    });
};

export const fetchWallets = async (params: {
    page?: number;
    limit?: number;
    search?: string;
} = {}) => {
    return api.get<Paginated<unknown>>("/admin/financial/wallets", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
        },
    });
};

export const fetchAuditLogs = async (params: {
    page?: number;
    limit?: number;
} = {}) => {
    return api.get("/admin/audit-logs", {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
    });
};
