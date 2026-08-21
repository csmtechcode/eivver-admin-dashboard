import api from "./api";
import type { Paginated } from "@/types/api";
import type {
    AdminReview,
    ReviewModerationStatus,
    ReviewStats,
} from "@/types/admin";

export interface ListReviewsParams {
    page?: number;
    limit?: number;
    status?: ReviewModerationStatus;
    rating?: number;
    fixerId?: string;
    search?: string;
}

export const fetchReviews = async (
    params: ListReviewsParams = {}
): Promise<Paginated<AdminReview>> => {
    return api.get<Paginated<AdminReview>>("/admin/reviews", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status || undefined,
            rating: params.rating || undefined,
            fixerId: params.fixerId || undefined,
            search: params.search || undefined,
        },
    });
};

export const fetchReviewStats = async (): Promise<ReviewStats> => {
    const data = await api.get<{ stats: ReviewStats }>("/admin/reviews/stats");

    return data.stats;
};

export const moderateReview = async (
    id: string,
    payload: { status: ReviewModerationStatus; adminNotes?: string }
): Promise<void> => {
    await api.patch(`/admin/reviews/${id}/moderate`, payload);
};