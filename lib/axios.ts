import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

import { clearAuth, getRefreshToken, getToken, setToken } from "./auth";
import { API_BASE_URL } from "./constants";

interface ApiEnvelope<T = unknown> {
    success: boolean;
    message: string | string[];
    data: T;
}

interface ApiClient {
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    headers: {
        "Content-Type": "application/json",
    },
});

const api: ApiClient = {
    get: <T,>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        http.get<T, T>(url, config),
    post: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        http.post<T, T>(url, data, config),
    patch: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        http.patch<T, T>(url, data, config),
    put: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        http.put<T, T>(url, data, config),
    delete: <T,>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        http.delete<T, T>(url, config),
};

http.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const { data } = await axios.post<ApiEnvelope<{
            accessToken: string;
            refreshToken?: string;
        }>>(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
        });

        const payload = data.data;

        if (!payload?.accessToken) return null;

        setToken(payload.accessToken, payload.refreshToken);

        return payload.accessToken;
    } catch {
        return null;
    }
}

function redirectToLogin() {
    clearAuth();

    if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
    ) {
        window.location.href = "/login";
    }
}

http.interceptors.response.use(
    (response: AxiosResponse<ApiEnvelope>) => {
        const envelope = response.data;

        if (envelope && typeof envelope === "object" && "success" in envelope) {
            return envelope.data as unknown as AxiosResponse;
        }

        return response;
    },
    async (error: AxiosError<ApiEnvelope>) => {
        const original = error.config as
            | (InternalAxiosRequestConfig & { _retried?: boolean })
            | undefined;

        const status = error.response?.status;
        const isAuthEndpoint =
            original?.url?.includes("/auth/login") ||
            original?.url?.includes("/auth/refresh-token");

        if (status === 401 && original && !original._retried && !isAuthEndpoint) {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }

            const newToken = await refreshPromise;

            if (newToken) {
                original._retried = true;
                original.headers.Authorization = `Bearer ${newToken}`;

                return http(original);
            }

            redirectToLogin();
            return Promise.reject(error);
        }

        if (status === 401 && original?.url?.includes("/auth/refresh-token")) {
            redirectToLogin();
        }

        return Promise.reject(error);
    }
);

export function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as Partial<ApiEnvelope> | undefined;

        if (data?.message) {
            return Array.isArray(data.message) ? data.message.join(" ") : data.message;
        }

        return error.message || "Something went wrong. Please try again.";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}

export default api;
