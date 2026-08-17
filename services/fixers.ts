import api from "./api";
import type { Paginated } from "@/types/api";
import type {
    AdminFixer,
    AvailabilityStatus,
    FixerDocument,
    FixerEarnings,
    FixerMetrics,
    VerificationStatus,
} from "@/types/fixer";

export interface ListFixersParams {
    page?: number;
    limit?: number;
    search?: string;
    verificationStatus?: VerificationStatus;
    availabilityStatus?: AvailabilityStatus;
    serviceCategory?: string;
}

export const fetchFixers = async (
    params: ListFixersParams = {}
): Promise<Paginated<AdminFixer>> => {
    return api.get<Paginated<AdminFixer>>("/admin/fixers", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
            verificationStatus: params.verificationStatus || undefined,
            availabilityStatus: params.availabilityStatus || undefined,
            serviceCategory: params.serviceCategory || undefined,
        },
    });
};

export const fetchFixerById = async (id: string): Promise<{
    fixer: AdminFixer;
    metrics: FixerMetrics;
}> => {
    return api.get(`/admin/fixers/${id}`);
};

export const fetchFixerMetrics = async (id: string): Promise<FixerMetrics> => {
    const data = await api.get<{ metrics: FixerMetrics }>(
        `/admin/fixers/${id}/metrics`
    );

    return data.metrics;
};

export const fetchFixerDocuments = async (id: string): Promise<FixerDocument[]> => {
    const data = await api.get<{ documents: FixerDocument[] }>(
        `/admin/fixers/${id}/documents`
    );

    return data.documents;
};

export const fetchFixerEarnings = async (id: string): Promise<{
    summary: {
        totalSettlements: number;
        totalGrossKobo: number;
        totalCommissionKobo: number;
        totalEarningsKobo: number;
        totalGross: number;
        totalCommission: number;
        totalEarnings: number;
    };
    settlements: FixerEarnings["settlements"];
}> => {
    const data = await api.get<{
        summary: {
            totalSettlements: number;
            totalGrossKobo: number;
            totalCommissionKobo: number;
            totalEarningsKobo: number;
            totalGross: number;
            totalCommission: number;
            totalEarnings: number;
        };
        settlements: FixerEarnings["settlements"];
    }>(`/admin/fixers/${id}/earnings`);

    return data;
};

export const fetchPendingFixers = async (
    params: ListFixersParams = {}
): Promise<Paginated<AdminFixer>> => {
    return api.get<Paginated<AdminFixer>>("/admin/fixers/pending", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
        },
    });
};

export const fetchPendingFixersCount = async (): Promise<number> => {
    const data = await api.get<{ count: number }>("/admin/fixers/pending/count");

    return data.count;
};

export const fetchFixerDashboardStats = async (): Promise<{
    totalFixers: number;
    pendingFixers: number;
    onlineFixers: number;
    offlineFixers: number;
    busyFixers: number;
    verifiedFixers: number;
}> => {
    const data = await api.get<{
        stats: {
            totalFixers: number;
            pendingFixers: number;
            onlineFixers: number;
            offlineFixers: number;
            busyFixers: number;
            verifiedFixers: number;
        };
    }>("/admin/dashboard/fixers");

    return data.stats;
};

export const approveFixer = async (id: string, reason?: string): Promise<AdminFixer> => {
    return api.patch(`/admin/fixers/${id}/approve`, { reason });
};

export const rejectFixer = async (id: string, reason: string): Promise<AdminFixer> => {
    return api.patch(`/admin/fixers/${id}/reject`, { reason });
};

export const suspendFixer = async (id: string, reason: string): Promise<AdminFixer> => {
    return api.patch(`/admin/fixers/${id}/suspend`, { reason });
};

export const banFixer = async (id: string, reason: string): Promise<AdminFixer> => {
    return api.patch(`/admin/fixers/${id}/ban`, { reason });
};

export const reactivateFixer = async (id: string, reason?: string): Promise<AdminFixer> => {
    return api.patch(`/admin/fixers/${id}/reactivate`, { reason });
};

export function displayName(fixer: AdminFixer): string {
    if (fixer.user?.name) return fixer.user.name;
    if (fixer.user) {
        return [fixer.user.firstName, fixer.user.lastName].filter(Boolean).join(" ");
    }
    return fixer.name || "Unknown fixer";
}

export function fixerLocation(fixer: AdminFixer): string {
    return [fixer.locationCity, fixer.locationState].filter(Boolean).join(", ") || "-";
}
