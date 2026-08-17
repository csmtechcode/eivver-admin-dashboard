"use client";

import { ArrowUpRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchDashboardLatestPayments } from "@/services/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types/payment";

const statusColors: Record<string, string> = {
    pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    successful:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    failed:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    abandoned:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
    refunded:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    cancelled:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function LatestPayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetchDashboardLatestPayments()
            .then((data) => {
                if (!cancelled) setPayments(data);
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
        <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        Latest Payments
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Recent transactions received
                    </p>
                </div>

                <Link
                    href="/payments"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                    View all
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    Loading...
                </p>
            ) : payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    No payments yet.
                </p>
            ) : (
                <div className="space-y-5">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20">
                                    <CreditCard className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        {payment.reference}
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        {payment.provider} •{" "}
                                        {formatDate(payment.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-bold text-emerald-600">
                                    {formatCurrency(payment.amount)}
                                </p>

                                <span
                                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[payment.status] ?? statusColors.pending}`}
                                >
                                    {payment.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}