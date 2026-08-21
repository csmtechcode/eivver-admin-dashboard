import api from "./api";
import type { User } from "@/types/user";
import type { NotificationPreferences, UserActivityItem } from "@/types/admin";

export const fetchAdminProfile = async (): Promise<User> => {
    const data = await api.get<{ user: User }>("/admin/profile");

    return data.user;
};

export const updateAdminProfile = async (payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    image?: string;
}): Promise<User> => {
    const data = await api.patch<{ user: User }>("/admin/profile", payload);

    return data.user;
};

export const changeAdminPassword = async (payload: {
    currentPassword: string;
    newPassword: string;
}): Promise<{ message: string }> => {
    return api.patch("/admin/profile/password", payload);
};

export const fetchNotificationPreferences = async (): Promise<NotificationPreferences> => {
    const data = await api.get<{ preferences: NotificationPreferences }>(
        "/admin/profile/notification-preferences"
    );

    return data.preferences;
};

export const updateNotificationPreferences = async (
    payload: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
    const data = await api.patch<{ preferences: NotificationPreferences }>(
        "/admin/profile/notification-preferences",
        payload
    );

    return data.preferences;
};

export const fetchSecurityStatus = async (): Promise<{
    twoFactorEnabled: boolean;
    notificationPreferences: NotificationPreferences;
}> => {
    return api.get("/admin/profile/security");
};

export const startTwoFactorSetup = async (): Promise<{
    secret: string;
    otpauthUrl: string;
    issuer: string;
}> => {
    return api.post("/admin/profile/2fa/enable");
};

export const verifyTwoFactor = async (code: string): Promise<{ twoFactorEnabled: boolean }> => {
    return api.post("/admin/profile/2fa/verify", { code });
};

export const disableTwoFactor = async (code: string): Promise<{ twoFactorEnabled: boolean }> => {
    return api.post("/admin/profile/2fa/disable", { code });
};

export const fetchMyActivity = async (params: {
    page?: number;
    limit?: number;
} = {}): Promise<{
    items: UserActivityItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}> => {
    return api.get("/admin/profile/activity", {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
    });
};
