import api from "./api";
import type { Paginated } from "@/types/api";
import type { AdminTransaction, Wallet } from "@/types/admin";

export interface ListTransactionsParams {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
    from?: string;
    to?: string;
}

export const fetchTransactions = async (
    params: ListTransactionsParams = {}
): Promise<Paginated<AdminTransaction>> => {
    return api.get<Paginated<AdminTransaction>>("/admin/financial/transactions", {
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

export interface ListWalletsParams {
    page?: number;
    limit?: number;
    search?: string;
    minBalance?: number;
    maxBalance?: number;
}

export const fetchWallets = async (
    params: ListWalletsParams = {}
): Promise<Paginated<Wallet>> => {
    return api.get<Paginated<Wallet>>("/admin/financial/wallets", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
            minBalance: params.minBalance ?? undefined,
            maxBalance: params.maxBalance ?? undefined,
        },
    });
};

export const exportFinancialCsv = async (
    type: "transactions" | "payments" | "wallets" | "withdrawals"
): Promise<{ filename: string; csv: string }> => {
    return api.get("/admin/financial/export", { params: { type } });
};