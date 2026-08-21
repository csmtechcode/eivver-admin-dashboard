import api from "./api";
import type { Paginated } from "@/types/api";
import type { AdminUser } from "@/types/admin";

export interface ListAdminsParams {
    page?: number;
    limit?: number;
    search?: string;
    accountStatus?: string;
}

export interface CreateAdminPayload {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber?: string;
    image?: string;
}

export const fetchAdmins = async (
    params: ListAdminsParams = {}
): Promise<Paginated<AdminUser>> => {
    return api.get<Paginated<AdminUser>>("/admin/admins", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
            accountStatus: params.accountStatus || undefined,
        },
    });
};

export const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
    const data = await api.post<{ user: AdminUser }>("/admin/admins", payload);

    return data.user;
};

export const updateAdminStatus = async (
    id: string,
    payload: { action: "suspend" | "activate"; reason?: string }
): Promise<AdminUser> => {
    const data = await api.patch<{ user: AdminUser }>(`/admin/admins/${id}/status`, payload);

    return data.user;
};

export const deleteAdmin = async (id: string): Promise<void> => {
    await api.delete(`/admin/admins/${id}`);
};