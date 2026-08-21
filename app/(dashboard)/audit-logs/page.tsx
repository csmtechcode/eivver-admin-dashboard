"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import { fetchAuditLogs } from "@/services/withdrawals";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/types/admin";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [domainFilter, setDomainFilter] = useState("");
    const [actionFilter, setActionFilter] = useState("");

    useEffect(() => {
        let cancelled = false;

        fetchAuditLogs({
            page,
            limit: 20,
            domain: domainFilter || undefined,
            action: actionFilter || undefined,
        })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setLogs(data.items);
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
    }, [page, domainFilter, actionFilter]);

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Audit Logs"
                description="Full audit trail of every admin action on the platform"
            />

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">Audit Trail ({total})</h2>

                    <div className="flex flex-wrap gap-2">
                        <input
                            value={domainFilter}
                            onChange={(e) => {
                                setDomainFilter(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Filter by domain"
                            className="h-9 w-40 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />

                        <input
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Filter by action"
                            className="h-9 w-44 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading audit logs...
                    </p>
                ) : logs.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No audit logs found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Time</th>
                                    <th className="pb-3 pr-4 font-medium">Domain</th>
                                    <th className="pb-3 pr-4 font-medium">Action</th>
                                    <th className="pb-3 pr-4 font-medium">Actor</th>
                                    <th className="pb-3 pr-4 font-medium">Change</th>
                                    <th className="pb-3 font-medium">Reason</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr key={log.id} className="transition hover:bg-muted/50">
                                        <td className="whitespace-nowrap py-4 pr-4 text-xs text-muted-foreground">
                                            {formatDateTime(log.createdAt)}
                                        </td>

                                        <td className="py-4 pr-4">
                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                {log.domain}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-4 font-medium">
                                            <span className="inline-flex items-center gap-1.5">
                                                <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                                                {log.action}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-4 text-muted-foreground">
                                            {log.actorRole ? (
                                                <span className="capitalize">{log.actorRole}</span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className="py-4 pr-4 text-xs">
                                            <span className="text-muted-foreground line-through">
                                                {log.fromState ?? "—"}
                                            </span>{" "}
                                            →{" "}
                                            <span className="font-medium">
                                                {log.toState ?? "—"}
                                            </span>
                                        </td>

                                        <td className="max-w-xs py-4 text-xs text-muted-foreground">
                                            {log.reason ? (
                                                <span className="block truncate">{log.reason}</span>
                                            ) : (
                                                "—"
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
                        Page {page} of {totalPages} · {total} events
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