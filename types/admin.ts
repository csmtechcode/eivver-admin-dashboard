import type { AccountStatus, UserRole } from "./user";

export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid";

export type ReportCategory =
    | "scam"
    | "harassment"
    | "inappropriate_content"
    | "fraud"
    | "fake_profile"
    | "other";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export type BannerType = "info" | "warning" | "emergency" | "promo";

export type BannerAudience = "all" | "customers" | "fixers" | "admins";

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export interface Withdrawal {
    id: string;
    fixerUserId: string;
    fixerId: string;
    fixerName: string | null;
    fixerEmail: string | null;
    amountKobo: number;
    amount: number;
    currency: string;
    status: WithdrawalStatus;
    payoutDetails: Record<string, unknown> | null;
    note: string | null;
    adminNote: string | null;
    paidAt: string | null;
    payoutReference: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WithdrawalStatusLog {
    id: string;
    fromStatus: WithdrawalStatus;
    toStatus: WithdrawalStatus;
    actorName: string | null;
    actorId: string | null;
    reason: string | null;
    createdAt: string;
}

export interface WithdrawalDetail extends Withdrawal {
    statusLogs: WithdrawalStatusLog[];
}

export interface WithdrawalStats {
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
    totalAmount: number;
}

export interface AdminReview {
    id: string;
    bookingId: string | null;
    rating: number;
    comment: string | null;
    imageUrls: string[];
    status: ReviewModerationStatus;
    adminNotes: string | null;
    customerName: string;
    customerEmail: string | null;
    fixerId: string | null;
    fixerName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    pending: number;
    approved: number;
    rejected: number;
    hidden: number;
}

export interface ReportParty {
    id: string;
    name: string;
    email: string;
}

export interface Report {
    id: string;
    category: ReportCategory;
    description: string;
    status: ReportStatus;
    resolutionNote: string | null;
    reporter: ReportParty;
    reportedUser: ReportParty;
    handledByName: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ReportStats {
    pending: number;
    reviewed: number;
    resolved: number;
    dismissed: number;
}

export interface Banner {
    id: string;
    title: string;
    message: string;
    type: BannerType;
    audience: BannerAudience;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLog {
    id: string;
    domain: string;
    entityId: string;
    action: string;
    fromState: string | null;
    toState: string | null;
    actorId: string | null;
    actorRole: string | null;
    reason: string | null;
    createdAt: string;
}

export interface Wallet {
    id: string;
    userId: string;
    balanceKobo: number;
    currency: string;
    isActive: boolean;
    version: number;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string | null;
        name?: string;
        email: string;
        phoneNumber?: string | null;
        image?: string | null;
        role: UserRole;
    };
}

export interface AdminTransaction {
    id: string;
    reference: string;
    userId: string;
    walletId: string | null;
    paymentId: string | null;
    bookingId: string | null;
    amountKobo: number;
    currency: string;
    type: string;
    walletTxType: string | null;
    status: string;
    description: string | null;
    metadata: Record<string, unknown> | null;
    balanceBeforeKobo: number | null;
    balanceAfterKobo: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminUser {
    id: string;
    firstName: string;
    lastName: string | null;
    name?: string;
    email: string;
    phoneNumber: string | null;
    image: string | null;
    role: UserRole;
    isVerified: boolean;
    accountStatus: AccountStatus;
    createdAt: string;
    updatedAt: string;
    fixerProfile?: {
        id: string;
        bio: string | null;
        skills: string[];
        trade: string;
        yearsOfExperience: number;
        location: {
            country: string;
            state: string;
            city: string;
            address: string | null;
            latitude: number | null;
            longitude: number | null;
        };
        profilePhoto: string | null;
        isOnline: boolean;
        availabilityStatus: string;
        lastLocationUpdatedAt: string | null;
    } | null;
}

export interface UserActivityItem {
    id: string;
    domain: string;
    action: string;
    entityId?: string;
    fromState: string | null;
    toState: string | null;
    actorId?: string | null;
    actorRole?: string | null;
    reason: string | null;
    createdAt: string;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
}

export interface FixerReview {
    id: string;
    bookingId: string | null;
    customerName: string;
    customerEmail: string | null;
    rating: number;
    comment: string | null;
    status: ReviewModerationStatus;
    adminNotes: string | null;
    createdAt: string;
}
