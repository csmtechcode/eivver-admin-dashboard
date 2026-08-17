export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.eivver.com";

export const STORAGE_KEYS = {
    token: "eivver_admin_token",
    refreshToken: "eivver_admin_refresh_token",
    user: "eivver_admin_user",
    theme: "eivver_admin_theme",
} as const;

export const APP_NAME = "EIVVER Admin";

export const CURRENCY_SYMBOL = "₦";
