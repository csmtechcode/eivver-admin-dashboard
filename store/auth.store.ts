import { create } from "zustand";

import {
    clearAuth,
    getStoredUser,
    getToken,
    setStoredUser,
    setToken,
} from "@/lib/auth";
import type { User } from "@/types/user";

interface AuthStore {
    user: User | null;
    token: string | null;

    login: (user: User, token: string, refreshToken?: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: getStoredUser(),
    token: getToken(),

    login: (user, token, refreshToken) => {
        setToken(token, refreshToken);
        setStoredUser(user);

        set({
            user,
            token,
        });
    },

    logout: () => {
        clearAuth();

        set({
            user: null,
            token: null,
        });
    },
}));
