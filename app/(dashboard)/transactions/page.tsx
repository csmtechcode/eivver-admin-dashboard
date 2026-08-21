"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Download } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import { exportFinancialCsv, fetchTransactions } from "@/services/financial";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatDateTime, formatKobo } from "@/lib/utils";
import type { AdminTransaction } from "@/types/admin";

const statusStyles: Record<string, string> = {
    successful: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    refunded: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        let cancelled = false;

        fetchTransactions({
            page,
            limit: 20,
            type: typeFilter || undefined,
            status: statusFilter || undefined,
        })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setTransactions(data.items);
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
    }, [page, typeFilter, statusFilter]);

    async function handleExport() {
        try {
            const { filename, csv } = await exportFinancialCsv("transactions");
            downloadCsv(filename, csv);
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Transactions"
                description="Ledger of every wallet and payment movement on the platform"
            >
                <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </button>
            </PageHeader>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">All Transactions ({total})</h2>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium"
                        >
                            <option value="">All types</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                            <option value="payout">Payout</option>
                            <option value="refund">Refund</option>
                            <option value="payment">Payment</option>
                            <option value="commission">Commission</option>
                            <option value="settlement">Settlement</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium"
                        >
                            <option value="">All statuses</option>
                            <option value="successful">Successful</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
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
                        Loading transactions...
                    </p>
                ) : transactions.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No transactions found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Reference</th>
                                    <th className="pb-3 pr-4 font-medium">Type</th>
                                    <th className="pb-3 pr-4 font-medium">Amount</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 pr-4 font-medium">Balance After</th>
                                    <th className="pb-3 pr-4 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Description</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="transition hover:bg-muted/50">
                                        <td className="py-4 pr-4">
                                            <p className="flex items-center gap-1.5 font-medium">
                                                <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                {tx.reference}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.userId.slice(0, 8)}…
                                            </p>
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                {tx.type}
                                            </span>
                                        </td>

                                        <td
                                            className={`py-4 pr-4 font-medium ${
                                                tx.type === "credit" ||
                                                tx.type === "refund" ||
                                                tx.type === "settlement"
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {formatKobo(tx.amountKobo)}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                                                    statusStyles[tx.status] ?? statusStyles.pending
                                                }`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-4 text-muted-foreground">
                                            {tx.balanceAfterKobo !== null
                                                ? formatKobo(tx.balanceAfterKobo)
                                                : "-"}
                                        </td>

                                        <td className="whitespace-nowrap py-4 pr-4 text-xs text-muted-foreground">
                                            {formatDateTime(tx.createdAt)}
                                        </td>

                                        <td className="max-w-xs py-4 text-xs text-muted-foreground">
                                            {tx.description ?? "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} transactions
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