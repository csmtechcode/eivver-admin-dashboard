import api from "./api";
import type { Paginated } from "@/types/api";
import type {
    AuditLog,
    Withdrawal,
    WithdrawalDetail,
    WithdrawalStatus,
    WithdrawalStats,
} from "@/types/admin";

export interface ListWithdrawalsParams {
    page?: number;
    limit?: number;
    status?: WithdrawalStatus;
    fixerUserId?: string;
    from?: string;
    to?: string;
}

export const fetchWithdrawals = async (
    params: ListWithdrawalsParams = {}
): Promise<Paginated<Withdrawal>> => {
    return api.get<Paginated<Withdrawal>>("/admin/withdrawals", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status || undefined,
            fixerUserId: params.fixerUserId || undefined,
            from: params.from || undefined,
            to: params.to || undefined,
        },
    });
};

export const fetchWithdrawalStats = async (): Promise<WithdrawalStats> => {
    const data = await api.get<{ stats: WithdrawalStats }>("/admin/withdrawals/stats");

    return data.stats;
};

export const fetchWithdrawalById = async (id: string): Promise<WithdrawalDetail> => {
    const data = await api.get<{ withdrawal: WithdrawalDetail }>(`/admin/withdrawals/${id}`);

    return data.withdrawal;
};

export const approveWithdrawal = async (
    id: string,
    payload: { adminNote?: string; payoutReference?: string } = {}
): Promise<void> => {
    await api.patch(`/admin/withdrawals/${id}/approve`, payload);
};

export const rejectWithdrawal = async (
    id: string,
    payload: { adminNote?: string } = {}
): Promise<void> => {
    await api.patch(`/admin/withdrawals/${id}/reject`, payload);
};

export const markPaidWithdrawal = async (
    id: string,
    payload: { adminNote?: string; payoutReference?: string } = {}
): Promise<void> => {
    await api.patch(`/admin/withdrawals/${id}/mark-paid`, payload);
};

export const exportWithdrawalsCsv = async (): Promise<{ filename: string; csv: string }> => {
    return api.get("/admin/withdrawals/export");
};

export interface ListAuditParams {
    page?: number;
    limit?: number;
    domain?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
}

export const fetchAuditLogs = async (
    params: ListAuditParams = {}
): Promise<Paginated<AuditLog>> => {
    return api.get<Paginated<AuditLog>>("/admin/audit-logs", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            domain: params.domain || undefined,
            action: params.action || undefined,
            actorId: params.actorId || undefined,
            from: params.from || undefined,
            to: params.to || undefined,
        },
    });
};