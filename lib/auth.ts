import type { User } from "@/types/user";

import { STORAGE_KEYS } from "./constants";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(STORAGE_KEYS.token);
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function setToken(token: string, refreshToken?: string): void {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEYS.token, token);

    if (refreshToken) {
        window.localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    }
}

export function clearAuth(): void {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(STORAGE_KEYS.token);
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
    window.localStorage.removeItem(STORAGE_KEYS.user);
}

export function getStoredUser(): User | null {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(STORAGE_KEYS.user);

    if (!raw) return null;

    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function setStoredUser(user: User): void {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
    return Boolean(getToken());
}
