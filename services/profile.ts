import api from "./api";
import type { User } from "@/types/user";

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
