import api from "./api";
import type { Paginated } from "@/types/api";
import type {
    BroadcastPayload,
    BroadcastResult,
    NotificationChannel,
    NotificationDeliveryLog,
    NotificationDeliveryStatus,
    NotificationStats,
} from "@/types/notifications";

export interface DeliveryLogsParams {
    page?: number;
    limit?: number;
    status?: NotificationDeliveryStatus;
    channel?: NotificationChannel;
    event?: string;
}

export interface DeliveryLogsResult extends Paginated<NotificationDeliveryLog> {
    statusBreakdown: Record<string, number>;
}

export const fetchNotificationStats = async (): Promise<NotificationStats> => {
    const data = await api.get<{ stats: NotificationStats }>(
        "/admin/notifications/stats"
    );

    return data.stats;
};

export const fetchDeliveryLogs = async (
    params: DeliveryLogsParams = {}
): Promise<DeliveryLogsResult> => {
    return api.get<DeliveryLogsResult>("/admin/notifications/delivery-logs", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status || undefined,
            channel: params.channel || undefined,
            event: params.event || undefined,
        },
    });
};

export const broadcastNotification = async (
    payload: BroadcastPayload
): Promise<BroadcastResult> => {
    return api.post<BroadcastResult>("/admin/notifications/broadcast", payload);
};

export const retryDeliveryLog = async (logId: string): Promise<NotificationDeliveryLog> => {
    const data = await api.post<{ log: NotificationDeliveryLog }>(
        `/admin/notifications/${logId}/retry`
    );

    return data.log;
};

export const retryAllFailedDeliveries = async (): Promise<{
    retried: number;
    skipped: number;
}> => {
    return api.post<{ retried: number; skipped: number }>(
        "/admin/notifications/retry-failed"
    );
};