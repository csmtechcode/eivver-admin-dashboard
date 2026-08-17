"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchDashboardLatestBookings } from "@/services/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types/booking";

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
        "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
    closed:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
    cancelled:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    rejected:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function LatestBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetchDashboardLatestBookings()
            .then((data) => {
                if (!cancelled) setBookings(data);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Latest Bookings
                </h2>

                <Link
                    href="/bookings"
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    View all
                </Link>
            </div>

            {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    Loading...
                </p>
            ) : bookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    No bookings yet.
                </p>
            ) : (
                <div className="space-y-5">
                    {bookings.map((booking) => (
                        <Link
                            key={booking.id}
                            href={`/bookings/${booking.id}`}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/20">
                                    <Wrench className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        {booking.customer?.name ?? "Customer"}
                                    </h3>

                                    <p className="text-sm text-gray-500 dark:text-muted-foreground">
                                        {booking.serviceName} ·{" "}
                                        {formatDate(booking.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-bold">
                                    {formatCurrency(
                                        booking.finalPrice ?? booking.priceEstimate
                                    )}
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.pending}`}
                                >
                                    {booking.status.replace("_", " ")}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}