import api from "./api";
import type { PlatformSettings } from "@/types/dashboard";

export const fetchSettings = async (): Promise<PlatformSettings> => {
    const data = await api.get<{ settings: PlatformSettings }>("/admin/settings");

    return data.settings;
};

export const updateSettings = async (
    payload: Partial<PlatformSettings>
): Promise<PlatformSettings> => {
    const data = await api.patch<{ settings: PlatformSettings }>("/admin/settings", payload);

    return data.settings;
};
