"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Flag, ShieldAlert, XCircle } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    exportReportsCsv,
    fetchReports,
    fetchReportStats,
    resolveReport,
} from "@/services/reports";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatDate } from "@/lib/utils";
import type { Report, ReportCategory, ReportStatus } from "@/types/admin";

const statusStyles: Record<ReportStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    dismissed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
};

const categoryLabels: Record<ReportCategory, string> = {
    scam: "Scam",
    harassment: "Harassment",
    inappropriate_content: "Inappropriate content",
    fraud: "Fraud",
    fake_profile: "Fake profile",
    other: "Other",
};

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<{
        pending: number;
        reviewed: number;
        resolved: number;
        dismissed: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
    const [detail, setDetail] = useState<Report | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchReports({ page, limit: 20, status: statusFilter || undefined })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setReports(data.items);
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
        fetchReportStats()
            .then((data) => setStats(data))
            .catch(() => {});
    }, []);

    async function handleResolve(report: Report, status: "resolved" | "dismissed") {
        const note = window.prompt("Resolution note (min 5 characters):");
        if (!note || note.length < 5) return;

        setActingId(report.id);
        setError(null);

        try {
            const updated = await resolveReport(report.id, { status, note });
            setReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleExport() {
        try {
            const { filename, csv } = await exportReportsCsv();
            downloadCsv(filename, csv);
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="User Reports"
                description="Handle reports and complaints between platform users"
            >
                <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </button>
            </PageHeader>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<Flag className="h-5 w-5 text-yellow-600" />}
                    label="Pending"
                    value={stats ? stats.pending.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<ShieldAlert className="h-5 w-5 text-blue-600" />}
                    label="Reviewed"
                    value={stats ? stats.reviewed.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    label="Resolved"
                    value={stats ? stats.resolved.toLocaleString() : "-"}
                />
                <StatCard
                    icon={<XCircle className="h-5 w-5 text-zinc-600" />}
                    label="Dismissed"
                    value={stats ? stats.dismissed.toLocaleString() : "-"}
                />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">Reports ({total})</h2>

                    <div className="flex flex-wrap gap-2">
                        {(["", "pending", "reviewed", "resolved", "dismissed"] as const).map(
                            (s) => (
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
                            )
                        )}
                    </div>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading reports...
                    </p>
                ) : reports.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No reports found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Reporter</th>
                                    <th className="pb-3 pr-4 font-medium">Reported User</th>
                                    <th className="pb-3 pr-4 font-medium">Category</th>
                                    <th className="pb-3 pr-4 font-medium">Date</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 font-medium" />
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {reports.map((report) => (
                                    <tr key={report.id} className="transition hover:bg-muted/50">
                                        <td className="py-4 pr-4">
                                            <p className="font-semibold">
                                                {report.reporter.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {report.reporter.email}
                                            </p>
                                        </td>

                                        <td className="py-4 pr-4">
                                            <p>{report.reportedUser.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {report.reportedUser.email}
                                            </p>
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                {categoryLabels[report.category] ?? report.category}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-4 text-muted-foreground">
                                            {formatDate(report.createdAt)}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[report.status]}`}
                                            >
                                                {report.status}
                                            </span>
                                        </td>

                                        <td className="py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setDetail(report)}
                                                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                                >
                                                    View
                                                </button>

                                                {report.status !== "resolved" && (
                                                    <button
                                                        onClick={() =>
                                                            handleResolve(report, "resolved")
                                                        }
                                                        disabled={actingId === report.id}
                                                        className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}

                                                {report.status !== "dismissed" && (
                                                    <button
                                                        onClick={() =>
                                                            handleResolve(report, "dismissed")
                                                        }
                                                        disabled={actingId === report.id}
                                                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60"
                                                    >
                                                        Dismiss
                                                    </button>
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
                        Page {page} of {totalPages} · {total} reports
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
                                    {categoryLabels[detail.category] ?? detail.category}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Reported {formatDate(detail.createdAt)}
                                </p>
                            </div>

                            <button
                                onClick={() => setDetail(null)}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Reporter
                                </p>
                                <p className="mt-1 font-semibold">{detail.reporter.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {detail.reporter.email}
                                </p>
                            </div>

                            <div className="rounded-xl border p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Reported user
                                </p>
                                <p className="mt-1 font-semibold">{detail.reportedUser.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {detail.reportedUser.email}
                                </p>
                            </div>
                        </div>

                        <p className="rounded-xl bg-muted p-4 text-sm">{detail.description}</p>

                        {detail.resolutionNote && (
                            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <span className="font-semibold">Resolution: </span>
                                {detail.resolutionNote}
                                {detail.handledByName && (
                                    <span className="mt-1 block text-xs opacity-80">
                                        by {detail.handledByName}
                                    </span>
                                )}
                            </p>
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