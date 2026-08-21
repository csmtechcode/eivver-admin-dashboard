import api from "./api";
import type { Paginated } from "@/types/api";
import type { Banner, BannerAudience, BannerType } from "@/types/admin";

export interface ListBannersParams {
    page?: number;
    limit?: number;
    type?: BannerType;
    audience?: BannerAudience;
    isActive?: boolean;
}

export interface BannerPayload {
    title: string;
    message: string;
    type?: BannerType;
    audience?: BannerAudience;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
}

export const fetchBanners = async (
    params: ListBannersParams = {}
): Promise<Paginated<Banner>> => {
    return api.get<Paginated<Banner>>("/admin/banners", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            type: params.type || undefined,
            audience: params.audience || undefined,
            isActive: params.isActive ?? undefined,
        },
    });
};

export const createBanner = async (payload: BannerPayload): Promise<Banner> => {
    const data = await api.post<{ banner: Banner }>("/admin/banners", payload);

    return data.banner;
};

export const updateBanner = async (id: string, payload: Partial<BannerPayload>): Promise<Banner> => {
    const data = await api.patch<{ banner: Banner }>(`/admin/banners/${id}`, payload);

    return data.banner;
};

export const deleteBanner = async (id: string): Promise<void> => {
    await api.delete(`/admin/banners/${id}`);
};