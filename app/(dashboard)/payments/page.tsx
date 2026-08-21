"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Download, RotateCcw, Wallet, XCircle } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    exportPaymentsCsv,
    fetchFinancialStats,
    fetchGatewayStatus,
    fetchPayments,
    refundPayment,
} from "@/services/payments";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatCurrency, formatDate } from "@/lib/utils";
import type { GatewayStatus, Payment, PaymentStatus } from "@/types/payment";

const statusStyles: Record<string, string> = {
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

const statusOptions: PaymentStatus[] = [
    "pending",
    "successful",
    "failed",
    "abandoned",
    "refunded",
    "cancelled",
];

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<PaymentStatus | "">("");
    const [stats, setStats] = useState<{
        totalRevenue: number;
        commissionEarned: number;
        walletBalance: number;
        totalPayments: number;
    } | null>(null);

    const [gatewayStatus, setGatewayStatus] = useState<{
        paystack: GatewayStatus;
        flutterwave: GatewayStatus;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchPayments({ page, limit: 15, status: status || undefined })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setPayments(data.items);
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

    useEffect(() => {
        fetchFinancialStats()
            .then((data) =>
                setStats({
                    totalRevenue: data.totalRevenue,
                    commissionEarned: data.commissionEarned,
                    walletBalance: data.walletBalance,
                    totalPayments: data.successfulPayments.count,
                })
            )
            .catch(() => {});

        fetchGatewayStatus()
            .then((data) => setGatewayStatus(data))
            .catch(() => {});
    }, []);

    async function handleRefund(payment: Payment) {
        if (
            !window.confirm(
                `Refund payment ${payment.reference} (${formatCurrency(payment.amount)})?`
            )
        ) {
            return;
        }

        const reason = window.prompt("Reason for this refund?");

        if (!reason) return;

        setError(null);

        try {
            const updated = await refundPayment(payment.reference, reason);

            setPayments((prev) =>
                prev.map((p) =>
                    p.reference === payment.reference ? { ...p, ...updated } : p
                )
            );
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 15));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Payments"
                description="Monitor payments, refunds and revenue across the platform"
            >
                <button
                    onClick={async () => {
                        try {
                            const { filename, csv } = await exportPaymentsCsv();
                            downloadCsv(filename, csv);
                        } catch (err) {
                            setError(getApiErrorMessage(err));
                        }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </button>
            </PageHeader>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<CreditCard className="h-5 w-5 text-blue-600" />}
                    label="Gross Revenue"
                    value={stats ? formatCurrency(stats.totalRevenue) : "-"}
                />

                <StatCard
                    icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
                    label="Commission Earned"
                    value={stats ? formatCurrency(stats.commissionEarned) : "-"}
                />

                <StatCard
                    icon={<Wallet className="h-5 w-5 text-purple-600" />}
                    label="Wallet Balances"
                    value={stats ? formatCurrency(stats.walletBalance) : "-"}
                />

                <StatCard
                    icon={<CreditCard className="h-5 w-5 text-zinc-600" />}
                    label="Total Payments"
                    value={stats ? stats.totalPayments.toLocaleString() : "-"}
                />
            </div>

            {gatewayStatus && (
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-4 text-lg font-semibold">Payment Gateway Status</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <GatewayCard
                            name="Paystack"
                            status={gatewayStatus.paystack}
                        />
                        <GatewayCard
                            name="Flutterwave"
                            status={gatewayStatus.flutterwave}
                        />
                    </div>
                </div>
            )}

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">
                        All Payments ({total})
                    </h2>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value as PaymentStatus | "");
                            setPage(1);
                        }}
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary sm:w-56"
                    >
                        <option value="">All statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
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
                        Loading payments...
                    </p>
                ) : payments.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No payments found.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold">
                                        {payment.reference}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {payment.provider} · {payment.currency} ·{" "}
                                        {formatDate(payment.createdAt)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold">
                                            {formatCurrency(payment.amount)}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {payment.bookingId ?? "No booking"}
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[payment.status] ?? statusStyles.pending}`}
                                    >
                                        {payment.status}
                                    </span>

                                    {payment.status === "successful" && (
                                        <button
                                            onClick={() => handleRefund(payment)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} payments
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

function GatewayCard({
    name,
    status,
}: {
    name: string;
    status: GatewayStatus;
}) {
    const statusColor =
        status.status === "healthy"
            ? "text-emerald-600"
            : status.status === "unreachable"
              ? "text-red-600"
              : "text-zinc-500";

    return (
        <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
                <p className="font-medium">{name}</p>
                <p className={`text-sm ${statusColor}`}>
                    {status.status === "healthy"
                        ? "Connected & healthy"
                        : status.status === "unreachable"
                          ? "Configured but unreachable"
                          : "Not configured"}
                </p>
            </div>
            {status.status === "healthy" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : status.status === "unreachable" ? (
                <XCircle className="h-5 w-5 text-red-600" />
            ) : (
                <XCircle className="h-5 w-5 text-zinc-400" />
            )}
        </div>
    );
}