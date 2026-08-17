export type PaymentStatus =
    | "pending"
    | "successful"
    | "failed"
    | "abandoned"
    | "refunded"
    | "cancelled";

export interface Payment {
    id: string;
    reference: string;
    userId: string;
    amountKobo: number;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: string;
    bookingId: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FinancialStats {
    totalRevenue: number;
    commissionEarned: number;
    walletBalance: number;
    pendingWithdrawals: { count: number; amount: number };
    successfulPayments: { count: number; amount: number };
    failedPayments: { count: number; amount: number };
    refunds: { count: number; amount: number };
}

export interface WithdrawalStats {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    paidCount: number;
    pendingVolume: number;
    paidVolume: number;
}