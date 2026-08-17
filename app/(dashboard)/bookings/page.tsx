"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import PageHeader from "@/components/layout/page-header";
import { fetchBookings } from "@/services/bookings";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/booking";

const statusStyles: Record<string, string> = {
    pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    accepted:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    on_the_way:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    arrived:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    in_progress:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    completed:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    closed:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
    cancelled:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    rejected:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const statusOptions: BookingStatus[] = [
    "pending",
    "accepted",
    "on_the_way",
    "arrived",
    "in_progress",
    "completed",
    "closed",
    "cancelled",
    "rejected",
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<BookingStatus | "">("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchBookings({ page, limit: 15, status: status || undefined })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setBookings(data.items);
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
    }, [page, status]);

    const totalPages = Math.max(1, Math.ceil(total / 15));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Bookings"
                description="Track and manage all bookings across the platform"
            />

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">
                        All Bookings ({total})
                    </h2>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value as BookingStatus | "");
                            setPage(1);
                        }}
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary sm:w-56"
                    >
                        <option value="">All statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option.replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading bookings...
                    </p>
                ) : bookings.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No bookings found.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="rounded-xl border p-5 transition hover:bg-muted/50"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/bookings/${booking.id}`}
                                            className="font-semibold hover:underline"
                                        >
                                            {booking.id}
                                        </Link>

                                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                            {booking.serviceName} ·{" "}
                                            {booking.customer?.name ?? "Customer"} ·{" "}
                                            {booking.fixer?.user?.name ?? "Fixer"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {formatCurrency(
                                                    booking.finalPrice ??
                                                        booking.priceEstimate
                                                )}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {booking.scheduledFor
                                                    ? formatDate(booking.scheduledFor)
                                                    : "Not scheduled"}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[booking.status] ?? statusStyles.pending}`}
                                        >
                                            {booking.status.replace("_", " ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} bookings
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
