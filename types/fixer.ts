import type { User } from "./user";

export type VerificationStatus = "pending" | "verified" | "unverified";

export type AvailabilityStatus = "online" | "offline" | "busy";

export interface AdminFixer {
    id: string;
    user?: Pick<
        User,
        "id" | "name" | "firstName" | "lastName" | "email" | "phone" | "image" | "accountStatus"
    > | null;
    name: string;
    trade: string;
    serviceCategory: string;
    skills: string[];
    yearsOfExperience: number;
    rating: number;
    completedJobs: number;
    bio?: string | null;
    profilePhoto?: string | null;
    phone?: string | null;
    locationCity?: string | null;
    locationState?: string | null;
    locationCountry?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    isOnline: boolean;
    availabilityStatus: AvailabilityStatus;
    verificationStatus: VerificationStatus;
    status?: string;
    isActive: boolean;
    lastSeen?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FixerMetrics {
    totalAssignedBookings: number;
    totalDecidedBookings: number;
    acceptedBookings: number;
    completedOrClosedBookings: number;
    acceptanceRate: number | null;
    completionRate: number | null;
    averageRating: number;
    completedJobs: number;
}

export interface FixerDocument {
    id: string;
    fixer?: { id: string } | null;
    documentType: string;
    documentUrl: string;
    status: string;
    adminNotes?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface FixerActivityLog {
    id?: string;
    action: string;
    fromState?: string | null;
    toState?: string | null;
    reason?: string | null;
    createdAt: string;
}

export interface FixerEarnings {
    totalEarned: number;
    availableBalance?: number;
    pendingWithdrawal?: number;
    withdrawnTotal?: number;
    completedJobs?: number;
    settlements?: Array<{
        id: string;
        grossAmountKobo?: string;
        fixerEarningsKobo?: string;
        platformCommissionKobo?: string;
        status?: string;
        createdAt?: string;
    }>;
}