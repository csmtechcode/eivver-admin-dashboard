"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ShieldCheck, Star, XCircle } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import { fetchReviews, fetchReviewStats, moderateReview } from "@/services/reviews";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { AdminReview, ReviewModerationStatus } from "@/types/admin";

const statusStyles: Record<ReviewModerationStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<{
        pending: number;
        approved: number;
        rejected: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<ReviewModerationStatus | "">("");
    const [ratingFilter, setRatingFilter] = useState<number | "">("");

    useEffect(() => {
        let cancelled = false;

        fetchReviews({
            page,
            limit: 20,
            status: statusFilter || undefined,
            rating: ratingFilter || undefined,
        })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setReviews(data.items);
                setTotal(data.meta.total);
            })
            .catch((err) => {
                if (!cancelled) setError(getApiErrorMessage(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [page, statusFilter, ratingFilter]);

    useEffect(() => {
        fetchReviewStats()
            .then((data) =>
                setStats({
                    pending: data.pending,
                    approved: data.approved,
                    rejected: data.rejected,
                })
            )
            .catch(() => {});
    }, []);

    async function handleModerate(review: AdminReview, status: ReviewModerationStatus) {
        const adminNotes =
            status === "rejected"
                ? window.prompt("Reason for rejecting this review:") ?? undefined
                : undefined;

        if (status === "rejected" && !adminNotes) return;

        setActingId(review.id);
        setError(null);

        try {
            await moderateReview(review.id, { status, adminNotes });
            setReviews((prev) =>
                prev.map((r) => (r.id === review.id ? { ...r, status } : r))
            );
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Reviews"
                description="Moderate fixer reviews before they go public"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    icon={<Clock className="h-5 w-5 text-yellow-600" />}
                    label="Pending Review"
                    value={stats ? stats.pending.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    label="Approved"
                    value={stats ? stats.approved.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<XCircle className="h-5 w-5 text-red-600" />}
                    label="Rejected"
                    value={stats ? stats.rejected.toLocaleString() : "-"}
                />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">All Reviews ({total})</h2>

                    <div className="flex flex-wrap gap-2">
                        {(["", "pending", "approved", "rejected"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setStatusFilter(s);
                                    setPage(1);
                                }}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                    statusFilter === s
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                            >
                                {s === "" ? "All" : s}
                            </button>
                        ))}

                        <select
                            value={ratingFilter}
                            onChange={(e) => {
                                setRatingFilter(
                                    e.target.value === "" ? "" : Number(e.target.value)
                                );
                                setPage(1);
                            }}
                            className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium"
                        >
                            <option value="">Any rating</option>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                    {r} star{r > 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading reviews...
                    </p>
                ) : reviews.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No reviews found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Fixer</th>
                                    <th className="pb-3 pr-4 font-medium">Customer</th>
                                    <th className="pb-3 pr-4 font-medium">Rating</th>
                                    <th className="pb-3 pr-4 font-medium">Comment</th>
                                    <th className="pb-3 pr-4 font-medium">Date</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 font-medium" />
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {reviews.map((review) => (
                                    <tr key={review.id} className="transition hover:bg-muted/50">
                                        <td className="py-4 pr-4 font-semibold">
                                            {review.fixerName ?? "—"}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <p>{review.customerName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {review.customerEmail ?? ""}
                                            </p>
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span className="inline-flex items-center gap-1 font-semibold text-yellow-600">
                                                <Star className="h-3.5 w-3.5 fill-current" />
                                                {review.rating}
                                            </span>
                                        </td>

                                        <td className="max-w-xs py-4 pr-4">
                                            <p className="truncate">{review.comment ?? "—"}</p>
                                        </td>

                                        <td className="py-4 pr-4 text-muted-foreground">
                                            {formatDate(review.createdAt)}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[review.status]}`}
                                            >
                                                {review.status}
                                            </span>
                                        </td>

                                        <td className="py-4">
                                            {review.status === "pending" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleModerate(review, "approved")
                                                        }
                                                        disabled={actingId === review.id}
                                                        className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleModerate(review, "rejected")
                                                        }
                                                        disabled={actingId === review.id}
                                                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleModerate(review, "pending")
                                                        }
                                                        disabled={actingId === review.id}
                                                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-60"
                                                    >
                                                        Reopen
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} reviews
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || loading}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center gap-4">
                <div className="rounded-xl bg-muted p-3">{icon}</div>

                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>

                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </div>
    );
}