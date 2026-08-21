"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, Download, XCircle } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    approveWithdrawal,
    exportWithdrawalsCsv,
    fetchWithdrawalById,
    fetchWithdrawals,
    fetchWithdrawalStats,
    markPaidWithdrawal,
    rejectWithdrawal,
} from "@/services/withdrawals";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatCurrency, formatDateTime } from "@/lib/utils";
import type { Withdrawal, WithdrawalStatus } from "@/types/admin";

const statusStyles: Record<WithdrawalStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<{
        pending: number;
        approved: number;
        rejected: number;
        paid: number;
        totalAmount: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "">("");
    const [detail, setDetail] = useState<{
        withdrawal: Withdrawal;
        statusLogs: Array<{
            id: string;
            fromStatus: string;
            toStatus: string;
            actorName: string | null;
            reason: string | null;
            createdAt: string;
        }>;
    } | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchWithdrawals({ page, limit: 20, status: statusFilter || undefined })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setWithdrawals(data.items);
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
    }, [page, statusFilter]);

    useEffect(() => {
        fetchWithdrawalStats()
            .then((data) => setStats(data))
            .catch(() => {});
    }, []);

    async function handleApprove(w: Withdrawal) {
        const note = window.prompt("Admin note (optional):") ?? undefined;
        setActingId(w.id);
        setError(null);

        try {
            await approveWithdrawal(w.id, { adminNote: note });
            refreshRow(w.id, "approved");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleReject(w: Withdrawal) {
        const note = window.prompt("Reason for rejecting this payout:");
        if (!note) return;

        setActingId(w.id);
        setError(null);

        try {
            await rejectWithdrawal(w.id, { adminNote: note });
            refreshRow(w.id, "rejected");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleMarkPaid(w: Withdrawal) {
        const reference = window.prompt("Payout provider reference (optional):") ?? undefined;
        setActingId(w.id);
        setError(null);

        try {
            await markPaidWithdrawal(w.id, { payoutReference: reference });
            refreshRow(w.id, "paid");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    function refreshRow(id: string, status: WithdrawalStatus) {
        setWithdrawals((prev) =>
            prev.map((w) => (w.id === id ? { ...w, status } : w))
        );
        setStats((prev) => prev ? { ...prev, [status]: prev[status] + 1 } : prev);
    }

    async function openDetail(id: string) {
        try {
            const detail = await fetchWithdrawalById(id);
            if (detail) setDetail({ withdrawal: detail, statusLogs: detail.statusLogs ?? [] });
        } catch {
            setDetail(null);
        }
    }

    async function handleExport() {
        try {
            const { filename, csv } = await exportWithdrawalsCsv();
            downloadCsv(filename, csv);
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Withdrawals"
                description="Approve, reject, and execute fixer payout requests"
            >
                <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </button>
            </PageHeader>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    icon={<Banknote className="h-5 w-5 text-yellow-600" />}
                    label="Pending"
                    value={stats ? stats.pending.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    label="Approved"
                    value={stats ? stats.approved.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<XCircle className="h-5 w-5 text-red-600" />}
                    label="Rejected"
                    value={stats ? stats.rejected.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    label="Paid"
                    value={stats ? stats.paid.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<Banknote className="h-5 w-5 text-zinc-600" />}
                    label="Total Volume"
                    value={stats ? formatCurrency(stats.totalAmount) : "-"}
                />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">
                        Withdrawal Requests ({total})
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {(["", "pending", "approved", "rejected", "paid"] as const).map((s) => (
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
                    </div>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading withdrawals...
                    </p>
                ) : withdrawals.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No withdrawals found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Fixer</th>
                                    <th className="pb-3 pr-4 font-medium">Amount</th>
                                    <th className="pb-3 pr-4 font-medium">Requested</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 pr-4 font-medium">Reference</th>
                                    <th className="pb-3 font-medium" />
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {withdrawals.map((w) => (
                                    <tr key={w.id} className="transition hover:bg-muted/50">
                                        <td className="py-4 pr-4">
                                            <p className="font-semibold">{w.fixerName ?? "—"}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {w.fixerEmail ?? ""}
                                            </p>
                                        </td>

                                        <td className="py-4 pr-4 font-medium">
                                            {formatCurrency(w.amount)}
                                        </td>

                                        <td className="py-4 pr-4 text-muted-foreground">
                                            {formatDateTime(w.createdAt)}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[w.status]}`}
                                            >
                                                {w.status}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-4 text-xs text-muted-foreground">
                                            {w.payoutReference ?? "-"}
                                        </td>

                                        <td className="py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDetail(w.id)}
                                                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                                >
                                                    Details
                                                </button>

                                                {w.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(w)}
                                                            disabled={actingId === w.id}
                                                            className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(w)}
                                                            disabled={actingId === w.id}
                                                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {w.status === "approved" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleMarkPaid(w)}
                                                            disabled={actingId === w.id}
                                                            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(w)}
                                                            disabled={actingId === w.id}
                                                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} withdrawals
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

            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl dark:bg-zinc-900">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {detail.withdrawal.fixerName ?? "Withdrawal"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {formatCurrency(detail.withdrawal.amount)} ·{" "}
                                    {detail.withdrawal.status}
                                </p>
                            </div>

                            <button
                                onClick={() => setDetail(null)}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                            >
                                Close
                            </button>
                        </div>

                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Requested</dt>
                                <dd>{formatDateTime(detail.withdrawal.createdAt)}</dd>
                            </div>

                            {detail.withdrawal.paidAt && (
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Paid</dt>
                                    <dd>{formatDateTime(detail.withdrawal.paidAt)}</dd>
                                </div>
                            )}

                            {detail.withdrawal.payoutReference && (
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Payout ref</dt>
                                    <dd className="text-right">
                                        {detail.withdrawal.payoutReference}
                                    </dd>
                                </div>
                            )}

                            {detail.withdrawal.note && (
                                <div className="flex justify-between gap-4">
                                    <dt className="shrink-0 text-muted-foreground">Fixer note</dt>
                                    <dd className="text-right">{detail.withdrawal.note}</dd>
                                </div>
                            )}

                            {detail.withdrawal.adminNote && (
                                <div className="flex justify-between gap-4">
                                    <dt className="shrink-0 text-muted-foreground">Admin note</dt>
                                    <dd className="text-right">{detail.withdrawal.adminNote}</dd>
                                </div>
                            )}
                        </dl>

                        {detail.statusLogs.length > 0 && (
                            <div className="mt-5">
                                <h4 className="mb-2 text-sm font-semibold">Status History</h4>

                                <ol className="space-y-3">
                                    {detail.statusLogs.map((log) => (
                                        <li key={log.id} className="text-sm">
                                            <p>
                                                <span className="font-medium capitalize">
                                                    {log.fromStatus}
                                                </span>{" "}
                                                →{" "}
                                                <span className="font-medium capitalize">
                                                    {log.toStatus}
                                                </span>
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {log.actorName ?? "Admin"} ·{" "}
                                                {formatDateTime(log.createdAt)}
                                            </p>

                                            {log.reason && (
                                                <p className="mt-0.5 text-xs italic text-muted-foreground">
                                                    "{log.reason}"
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
            )}
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