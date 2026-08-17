import api from "./api";
import type { User } from "@/types/user";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    const data = await api.post<LoginResponse>("/auth/login", payload);

    return data;
};

export const fetchCurrentUser = async (): Promise<User> => {
    return api.get<User>("/auth/profile");
};

export const logout = async (): Promise<void> => {
    await api.post("/auth/logout");
};
