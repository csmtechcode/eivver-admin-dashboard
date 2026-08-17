export type NotificationDeliveryStatus =
    | "PENDING"
    | "SENT"
    | "FAILED"
    | "RETRYING"
    | "EXHAUSTED";

export type NotificationChannel = "PUSH" | "EMAIL" | "SMS";

export type NotificationEvent =
    | "BOOKING_CREATED"
    | "BOOKING_ACCEPTED"
    | "BOOKING_REJECTED"
    | "BOOKING_CANCELLED"
    | "BOOKING_COMPLETED"
    | "PAYMENT_RECEIVED"
    | "PAYMENT_FAILED"
    | "WITHDRAWAL_APPROVED"
    | "WITHDRAWAL_REJECTED"
    | "ACCOUNT_VERIFIED"
    | "ACCOUNT_SUSPENDED"
    | "ADMIN_BROADCAST"
    | string;

export interface NotificationDeliveryLog {
    id: string;
    recipientId: string;
    event: NotificationEvent;
    channel: NotificationChannel;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    status: NotificationDeliveryStatus;
    retryCount: number;
    maxRetries: number;
    providerMessageId: string | null;
    lastError: string | null;
    nextRetryAt: string | null;
    contextId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationStats {
    total: number;
    sent: number;
    pending: number;
    failed: number;
    retried: number;
    statusBreakdown: Record<string, number>;
}

export interface BroadcastPayload {
    title: string;
    body: string;
    target?: "ALL" | "CUSTOMERS" | "FIXERS" | "VERIFIED_FIXERS";
    channels?: NotificationChannel[];
}

export interface BroadcastResult {
    targetedRecipients: number;
    dispatched: number;
    truncated: boolean;
    totalMatched: number;
}