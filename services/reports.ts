import api from "./api";
import type { Paginated } from "@/types/api";
import type {
    Banner,
    BannerAudience,
    BannerType,
    Report,
    ReportCategory,
    ReportStats,
    ReportStatus,
    ReviewModerationStatus,
} from "@/types/admin";

export interface ListReportsParams {
    page?: number;
    limit?: number;
    status?: ReportStatus;
    category?: ReportCategory;
    search?: string;
}

export const fetchReports = async (
    params: ListReportsParams = {}
): Promise<Paginated<Report>> => {
    return api.get<Paginated<Report>>("/admin/reports", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            status: params.status || undefined,
            category: params.category || undefined,
            search: params.search || undefined,
        },
    });
};

export const fetchReportStats = async (): Promise<ReportStats> => {
    const data = await api.get<{ stats: ReportStats }>("/admin/reports/stats");

    return data.stats;
};

export const fetchReportById = async (id: string): Promise<Report> => {
    const data = await api.get<{ report: Report }>(`/admin/reports/${id}`);

    return data.report;
};

export const resolveReport = async (
    id: string,
    payload: { status: "resolved" | "dismissed"; note: string }
): Promise<Report> => {
    const data = await api.patch<{ report: Report }>(`/admin/reports/${id}/resolve`, payload);

    return data.report;
};

export const exportReportsCsv = async (): Promise<{ filename: string; csv: string }> => {
    return api.get("/admin/reports/export");
};