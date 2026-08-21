import api from "./api";
import type { Paginated } from "@/types/api";
import type { Customer, User, UserRole, AccountStatus } from "@/types/user";

export interface ListCustomersParams {
    page?: number;
    limit?: number;
    search?: string;
    accountStatus?: AccountStatus;
    role?: UserRole;
}

export const fetchCustomers = async (
    params: ListCustomersParams = {}
): Promise<Paginated<User>> => {
    return api.get<Paginated<User>>("/admin/users", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
            accountStatus: params.accountStatus || undefined,
            role: "customer",
        },
    });
};

export const fetchCustomerById = async (id: string): Promise<{
    user: User;
    statusHistory: Array<{
        action: string;
        fromState?: string | null;
        toState?: string | null;
        actorRole?: string | null;
        reason?: string | null;
        createdAt: string;
    }>;
}> => {
    return api.get(`/admin/users/${id}`);
};

export const fetchUserStats = async (): Promise<{
    totalUsers: number;
    customers: number;
    fixers: number;
    admins: number;
    verified: number;
    suspended: number;
    banned: number;
    newToday: number;
    newThisMonth: number;
}> => {
    const data = await api.get<{
        stats: {
            totalUsers: number;
            customers: number;
            fixers: number;
            admins: number;
            verified: number;
            suspended: number;
            banned: number;
            newToday: number;
            newThisMonth: number;
        };
    }>("/admin/users/stats");

    return data.stats;
};

export const suspendCustomer = async (id: string, reason: string): Promise<User> => {
    return api.patch(`/admin/users/${id}/suspend`, { reason });
};

export const banCustomer = async (id: string, reason: string): Promise<User> => {
    return api.patch(`/admin/users/${id}/ban`, { reason });
};

export const reactivateCustomer = async (id: string, reason?: string): Promise<User> => {
    return api.patch(`/admin/users/${id}/reactivate`, { reason });
};

export const deleteCustomer = async (id: string): Promise<User> => {
    return api.delete(`/admin/users/${id}`);
};

export const restoreCustomer = async (id: string): Promise<User> => {
    return api.patch(`/admin/users/${id}/restore`);
};

export const exportUsersCsv = async (): Promise<{ filename: string; csv: string }> => {
    return api.get("/admin/users/export");
};

export const fetchUserActivity = async (
    id: string,
    params: { page?: number; limit?: number } = {}
): Promise<{
    user: User;
    activity: Array<{
        id: string;
        domain: string;
        action: string;
        fromState: string | null;
        toState: string | null;
        actorId: string | null;
        actorRole: string | null;
        reason: string | null;
        createdAt: string;
    }>;
    meta: { total: number; page: number; limit: number; totalPages: number };
}> => {
    return api.get(`/admin/users/${id}/activity`, {
        params: { page: params.page ?? 1, limit: params.limit ?? 20 },
    });
};

export const resetUserPassword = async (id: string, newPassword: string): Promise<User> => {
    const data = await api.patch<{ user: User }>(`/admin/users/${id}/reset-password`, {
        newPassword,
    });

    return data.user;
};

export const forceLogoutUser = async (id: string): Promise<User> => {
    const data = await api.patch<{ user: User }>(`/admin/users/${id}/force-logout`);

    return data.user;
};

export function toCustomer(user: User): Customer {
    const fixer = user.fixerProfile;
    const location = fixer?.location
        ? [fixer.location.city, fixer.location.state].filter(Boolean).join(", ")
        : undefined;

    return {
        id: user.id,
        name: user.name ?? [user.firstName, user.lastName].filter(Boolean).join(" "),
        email: user.email,
        phone: user.phone,
        location: location || undefined,
        image: user.image,
        status: user.accountStatus,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
    };
}
