"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    Download,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    exportFinancialCsv,
    fetchTransactions,
} from "@/services/financial";
import {
    fetchFinancialStats,
    fetchRevenueReport,
} from "@/services/payments";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatCurrency, formatDateTime } from "@/lib/utils";
import type { RevenueReport } from "@/types/dashboard";

type GroupBy = "day" | "week" | "month";

export default function FinancialReportsPage() {
    const [report, setReport] = useState<RevenueReport | null>(null);
    const [stats, setStats] = useState<{
        totalRevenue: number;
        commissionEarned: number;
        successfulPayments: { count: number; amount: number };
        refunds: { count: number; amount: number };
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [groupBy, setGroupBy] = useState<GroupBy>("day");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            fetchRevenueReport(
                fromDate || undefined,
                toDate || undefined,
                groupBy
            ),
            fetchFinancialStats(),
        ])
            .then(([revenueData, financialData]) => {
                if (cancelled) return;
                setReport(revenueData);
                setStats(financialData);
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
    }, [groupBy, fromDate, toDate]);

    async function handleExport(type: "transactions" | "payments" | "wallets" | "withdrawals") {
        try {
            const { filename, csv } = await exportFinancialCsv(type);
            downloadCsv(filename, csv);
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <p className="py-16 text-center text-sm text-muted-foreground">
                    Loading financial reports...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Financial Reports"
                description="Revenue, commissions, and financial analytics"
            >
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport("transactions")}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Transactions
                    </button>
                    <button
                        onClick={() => handleExport("payments")}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Payments
                    </button>
                    <button
                        onClick={() => handleExport("withdrawals")}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Withdrawals
                    </button>
                </div>
            </PageHeader>

            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                    label="Gross Revenue"
                    value={stats ? formatCurrency(stats.totalRevenue) : "-"}
                />
                <StatCard
                    icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
                    label="Commission Earned"
                    value={stats ? formatCurrency(stats.commissionEarned) : "-"}
                />
                <StatCard
                    icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                    label="Successful Payments"
                    value={stats ? `${stats.successfulPayments.count} (${formatCurrency(stats.successfulPayments.amount)})` : "-"}
                />
                <StatCard
                    icon={<TrendingDown className="h-5 w-5 text-red-600" />}
                    label="Refunds"
                    value={stats ? `${stats.refunds.count} (${formatCurrency(stats.refunds.amount)})` : "-"}
                />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">Revenue Report</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-muted-foreground">From:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                        <label className="text-sm text-muted-foreground">To:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        >
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                        </select>
                    </div>
                </div>

                {report && (
                    <>
                        <div className="mb-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">Total Gross Revenue</p>
                                <p className="mt-1 text-2xl font-bold">{formatCurrency(report.totals.grossRevenue)}</p>
                            </div>
                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">Total Commission</p>
                                <p className="mt-1 text-2xl font-bold">{formatCurrency(report.totals.commissionEarned)}</p>
                            </div>
                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">Total Fixer Earnings</p>
                                <p className="mt-1 text-2xl font-bold">{formatCurrency(report.totals.fixerEarnings)}</p>
                            </div>
                        </div>

                        {report.series.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No revenue data for the selected period.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">Period</th>
                                            <th className="pb-3 pr-4 font-medium">Gross Revenue</th>
                                            <th className="pb-3 pr-4 font-medium">Commission</th>
                                            <th className="pb-3 pr-4 font-medium">Fixer Earnings</th>
                                            <th className="pb-3 font-medium">Settlements</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {report.series.map((point) => (
                                            <tr key={point.period} className="transition hover:bg-muted/50">
                                                <td className="py-4 pr-4 font-medium">{point.period}</td>
                                                <td className="py-4 pr-4">{formatCurrency(point.grossRevenue)}</td>
                                                <td className="py-4 pr-4 text-emerald-600 font-medium">{formatCurrency(point.commissionEarned)}</td>
                                                <td className="py-4 pr-4">{formatCurrency(point.fixerEarnings)}</td>
                                                <td className="py-4">{point.settlementCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
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
