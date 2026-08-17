"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Bell,
    CheckCircle2,
    Clock,
    Megaphone,
    RefreshCw,
    Send,
    XCircle,
} from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    broadcastNotification,
    fetchDeliveryLogs,
    fetchNotificationStats,
    retryAllFailedDeliveries,
    retryDeliveryLog,
} from "@/services/notifications";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import type {
    NotificationDeliveryLog,
    NotificationDeliveryStatus,
    NotificationStats,
} from "@/types/notifications";

const STATUS_FILTERS: Array<NotificationDeliveryStatus | "ALL"> = [
    "ALL",
    "SENT",
    "PENDING",
    "FAILED",
    "RETRYING",
    "EXHAUSTED",
];

const STATUS_STYLES: Record<
    NotificationDeliveryStatus,
    { label: string; className: string }
> = {
    SENT: { label: "Sent", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
    RETRYING: { label: "Retrying", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
    EXHAUSTED: { label: "Exhausted", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
};

const TARGETS = [
    { value: "ALL", label: "Everyone" },
    { value: "CUSTOMERS", label: "Customers" },
    { value: "FIXERS", label: "Fixers" },
    { value: "VERIFIED_FIXERS", label: "Verified fixers" },
] as const;

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function NotificationsPage() {
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<NotificationDeliveryStatus | "ALL">("ALL");
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [target, setTarget] = useState<(typeof TARGETS)[number]["value"]>("ALL");
    const [channels, setChannels] = useState<string[]>(["PUSH"]);
    const [broadcasting, setBroadcasting] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [bulkRetrying, setBulkRetrying] = useState(false);

    const load = useCallback(() => {
        setLoading(true);

        Promise.all([
            fetchNotificationStats(),
            fetchDeliveryLogs({
                page,
                limit: 10,
                status: statusFilter === "ALL" ? undefined : statusFilter,
            }),
        ])
            .then(([statsData, logsData]) => {
                setStats(statsData);
                setLogs(logsData.items);
                setTotal(logsData.meta.total);
            })
            .catch((err) => setError(getApiErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [page, statusFilter]);

    useEffect(() => {
        let cancelled = false;

        const run = () => {
            Promise.all([
                fetchNotificationStats(),
                fetchDeliveryLogs({
                    page,
                    limit: 10,
                    status: statusFilter === "ALL" ? undefined : statusFilter,
                }),
            ])
                .then(([statsData, logsData]) => {
                    if (cancelled) return;
                    setStats(statsData);
                    setLogs(logsData.items);
                    setTotal(logsData.meta.total);
                })
                .catch((err) => {
                    if (!cancelled) setError(getApiErrorMessage(err));
                })
                .finally(() => {
                    if (!cancelled) setLoading(false);
                });
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [page, statusFilter]);

    async function handleBroadcast() {
        if (!title.trim() || !body.trim()) {
            setError("Title and message are required.");
            return;
        }

        setBroadcasting(true);
        setError(null);
        setMessage(null);

        try {
            const result = await broadcastNotification({
                title: title.trim(),
                body: body.trim(),
                target,
                channels: channels as Array<"PUSH" | "EMAIL" | "SMS">,
            });

            setMessage(
                `Broadcast dispatched to ${result.targetedRecipients} recipient(s)${result.truncated ? " (capped)" : ""}.`
            );
            setTitle("");
            setBody("");
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBroadcasting(false);
        }
    }

    async function handleRetry(logId: string) {
        setRetryingId(logId);
        setError(null);
        setMessage(null);

        try {
            await retryDeliveryLog(logId);
            setMessage("Delivery retry queued.");
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setRetryingId(null);
        }
    }

    async function handleRetryAll() {
        setBulkRetrying(true);
        setError(null);
        setMessage(null);

        try {
            const result = await retryAllFailedDeliveries();
            setMessage(`Bulk retry complete: ${result.retried} retried, ${result.skipped} skipped.`);
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBulkRetrying(false);
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 10));
    const retryableCount =
        (stats?.failed ?? 0) + (stats?.retried ?? 0);

    const statCards = [
        {
            label: "Total Deliveries",
            value: stats ? stats.total.toLocaleString() : "—",
            icon: <Bell className="h-5 w-5 text-blue-600" />,
        },
        {
            label: "Sent",
            value: stats ? stats.sent.toLocaleString() : "—",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        },
        {
            label: "Pending",
            value: stats ? stats.pending.toLocaleString() : "—",
            icon: <Clock className="h-5 w-5 text-amber-600" />,
        },
        {
            label: "Failed / Retrying",
            value: stats ? retryableCount.toLocaleString() : "—",
            icon: <XCircle className="h-5 w-5 text-red-600" />,
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Notifications"
                description="Broadcast announcements and monitor delivery health"
            >
                <button
                    onClick={handleRetryAll}
                    disabled={bulkRetrying || retryableCount === 0}
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw className={cn("h-4 w-4", bulkRetrying && "animate-spin")} />
                    Retry all failed
                </button>
            </PageHeader>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {message}
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-xl border bg-background p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {card.label}
                            </p>

                            {card.icon}
                        </div>

                        <h2 className="mt-4 text-3xl font-bold">
                            {card.value}
                        </h2>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
                {/* Broadcast composer */}
                <div className="rounded-2xl border bg-background p-6 shadow-sm xl:col-span-2">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Megaphone className="h-5 w-5" />
                        </span>

                        <div>
                            <h2 className="font-semibold">
                                Broadcast announcement
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Sent to all in-app feeds and selected channels
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Title
                            </label>

                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Scheduled maintenance tonight"
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Message
                            </label>

                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                placeholder="What do you want to tell everyone?"
                                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Audience
                            </label>

                            <select
                                value={target}
                                onChange={(e) => setTarget(e.target.value as typeof target)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                            >
                                {TARGETS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Channels
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {["PUSH", "EMAIL", "SMS"].map((channel) => (
                                    <label
                                        key={channel}
                                        className={cn(
                                            "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                            channels.includes(channel)
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={channels.includes(channel)}
                                            onChange={() =>
                                                setChannels((prev) =>
                                                    prev.includes(channel)
                                                        ? prev.filter((c) => c !== channel)
                                                        : [...prev, channel]
                                                )
                                            }
                                            className="sr-only"
                                        />
                                        {channel}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleBroadcast}
                            disabled={broadcasting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send className={cn("h-4 w-4", broadcasting && "animate-pulse")} />
                            {broadcasting ? "Broadcasting…" : "Send broadcast"}
                        </button>
                    </div>
                </div>

                {/* Delivery logs */}
                <div className="rounded-2xl border bg-background p-6 shadow-sm xl:col-span-3">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">
                                Delivery logs
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                {total} record(s)
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {STATUS_FILTERS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setPage(1);
                                    }}
                                    className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                                        statusFilter === status
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    {status === "ALL" ? "All" : STATUS_STYLES[status].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-16 animate-pulse rounded-xl bg-muted"
                                />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-14 text-center">
                            <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />

                            <p className="mt-3 text-sm font-medium">
                                No delivery logs{statusFilter !== "ALL" ? ` with status ${STATUS_STYLES[statusFilter].label}` : ""}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Title</th>
                                        <th className="pb-3 pr-4 font-medium">Channel</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 pr-4 font-medium">Retries</th>
                                        <th className="pb-3 pr-4 font-medium">Sent</th>
                                        <th className="pb-3 font-medium">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {logs.map((log) => {
                                        const style = STATUS_STYLES[log.status] ?? STATUS_STYLES.PENDING;
                                        const retryable =
                                            log.status === "FAILED" ||
                                            log.status === "EXHAUSTED" ||
                                            log.status === "RETRYING";

                                        return (
                                            <tr key={log.id}>
                                                <td className="py-3.5 pr-4">
                                                    <p className="font-medium">{log.title}</p>
                                                    <p className="max-w-56 truncate text-xs text-muted-foreground">
                                                        {log.body}
                                                    </p>
                                                </td>

                                                <td className="py-3.5 pr-4 text-muted-foreground">
                                                    {log.channel}
                                                </td>

                                                <td className="py-3.5 pr-4">
                                                    <span
                                                        className={cn(
                                                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                                            style.className
                                                        )}
                                                    >
                                                        {style.label}
                                                    </span>

                                                    {log.lastError && (
                                                        <p
                                                            className="mt-1 max-w-40 truncate text-[11px] text-muted-foreground"
                                                            title={log.lastError}
                                                        >
                                                            {log.lastError}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="py-3.5 pr-4 text-muted-foreground">
                                                    {log.retryCount}/{log.maxRetries}
                                                </td>

                                                <td className="py-3.5 pr-4 text-muted-foreground">
                                                    {formatDate(log.createdAt)}
                                                </td>

                                                <td className="py-3.5">
                                                    {retryable && (
                                                        <button
                                                            onClick={() => handleRetry(log.id)}
                                                            disabled={retryingId === log.id}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                                                        >
                                                            <RefreshCw
                                                                className={cn(
                                                                    "h-3.5 w-3.5",
                                                                    retryingId === log.id && "animate-spin"
                                                                )}
                                                            />
                                                            Retry
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page <= 1}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages}
                                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}