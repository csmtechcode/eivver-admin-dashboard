export type BookingStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "on_the_way"
    | "arrived"
    | "in_progress"
    | "completed"
    | "closed"
    | "cancelled";

export interface BookingUser {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string | null;
    image?: string | null;
}

export interface Booking {
    id: string;
    customer: BookingUser | null;
    fixer: {
        id: string;
        user: BookingUser | null;
        serviceCategory: string;
        status?: string;
        verificationStatus?: string;
        rating: number;
    } | null;
    serviceName: string;
    serviceId: string | null;
    notes: string | null;
    address: string | null;
    scheduledFor: string | null;
    priceEstimate: number;
    finalPrice: number | null;
    isEmergency: boolean;
    isRecurring: boolean;
    status: BookingStatus;
    cancellationReason: string | null;
    rescheduleReason: string | null;
    rejectionReason: string | null;
    completionNotes: string | null;
    acceptedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    acceptanceDeadline: string | null;
    lockedAt: string | null;
    images: Array<{ id: string; imageUrl: string; createdAt: string }>;
    createdAt: string;
    updatedAt: string;
}