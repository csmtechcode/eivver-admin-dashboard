import api from "./api";
import type { Paginated } from "@/types/api";
import type { FinancialStats, GatewayStatus, Payment, PaymentStatus, WithdrawalStats } from "@/types/payment";
import type { RevenueReport } from "@/types/dashboard";

export interface ListPaymentsParams {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    userId?: string;
    from?: string;
    to?: string;
}

export const fetchPayments = async (
    params: ListPaymentsParams = {}
): Promise<Paginated<Payment>> => {
    const data = await api.get<Paginated<Payment>>("/admin/financial/payments", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status || undefined,
            userId: params.userId || undefined,
            from: params.from || undefined,
            to: params.to || undefined,
        },
    });

    return {
        ...data,
        items: data.items.map(normalizePayment),
    };
};

export const fetchFailedPayments = async (
    params: ListPaymentsParams = {}
): Promise<Paginated<Payment>> => {
    const data = await api.get<Paginated<Payment>>("/admin/financial/payments/failed", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            userId: params.userId || undefined,
            from: params.from || undefined,
            to: params.to || undefined,
        },
    });

    return {
        ...data,
        items: data.items.map(normalizePayment),
    };
};

export const refundPayment = async (reference: string, reason: string): Promise<Payment> => {
    const data = await api.patch<Payment>(`/payments/${reference}/refund`, { reason });

    return normalizePayment(data);
};

export const exportPaymentsCsv = async (): Promise<{ filename: string; csv: string }> => {
    return api.get("/admin/financial/export", { params: { type: "payments" } });
};

export const fetchFinancialStats = async (): Promise<FinancialStats> => {
    const data = await api.get<{ stats: FinancialStats }>("/admin/financial/stats");

    return data.stats;
};

export const fetchWithdrawalStats = async (): Promise<WithdrawalStats> => {
    const data = await api.get<{ stats: WithdrawalStats }>("/admin/withdrawals/stats");

    return data.stats;
};

export const fetchRevenueReport = async (
    from?: string,
    to?: string,
    groupBy: "day" | "week" | "month" = "day"
): Promise<RevenueReport> => {
    return api.get("/admin/financial/revenue", { params: { from, to, groupBy } });
};

export function normalizePayment(payment: Payment): Payment {
    const amountKobo =
        typeof payment.amountKobo === "string"
            ? Number(payment.amountKobo)
            : Number(payment.amountKobo ?? 0);

    return {
        ...payment,
        amountKobo,
        amount: amountKobo / 100,
    };
}

export const fetchGatewayStatus = async (): Promise<{
    paystack: GatewayStatus;
    flutterwave: GatewayStatus;
}> => {
    return api.get("/admin/financial/gateway-status");
};
