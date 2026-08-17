"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";

import {
    fetchDeliveryLogs,
    fetchNotificationStats,
} from "@/services/notifications";
import type {
    NotificationDeliveryLog,
    NotificationDeliveryStatus,
    NotificationStats,
} from "@/types/notifications";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
    NotificationDeliveryStatus,
    { label: string; className: string; icon: typeof Clock }
> = {
    SENT: { label: "Sent", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", icon: CheckCircle2 },
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", icon: Clock },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", icon: XCircle },
    RETRYING: { label: "Retrying", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", icon: RefreshCw },
    EXHAUSTED: { label: "Exhausted", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", icon: XCircle },
};

function timeAgo(iso: string): string {
    const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function NotificationsBell() {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const load = useCallback(() => {
        Promise.all([
            fetchNotificationStats(),
            fetchDeliveryLogs({ page: 1, limit: 5 }),
        ])
            .then(([statsData, logsData]) => {
                setStats(statsData);
                setLogs(logsData.items);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 45_000);

        return () => clearInterval(interval);
    }, [load]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const attention =
        (stats?.failed ?? 0) + (stats?.pending ?? 0) + (stats?.retried ?? 0);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative rounded-lg border p-2 transition hover:bg-muted"
                aria-label={`Notifications${attention > 0 ? ` (${attention} need attention)` : ""}`}
            >
                <Bell className="h-5 w-5" />

                {attention > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {attention > 99 ? "99+" : attention}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <p className="font-semibold">
                                Notifications
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {stats
                                    ? `${stats.sent} sent · ${stats.total} total deliveries`
                                    : "Delivery activity"}
                            </p>
                        </div>

                        <Link
                            href="/notifications"
                            onClick={() => setOpen(false)}
                            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="space-y-3 p-5">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="h-14 animate-pulse rounded-xl bg-muted"
                                    />
                                ))}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />

                                <p className="mt-3 text-sm font-medium">
                                    No notifications yet
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Broadcasts and system events will appear here.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {logs.map((log) => {
                                    const style = STATUS_STYLES[log.status] ?? STATUS_STYLES.PENDING;
                                    const StatusIcon = style.icon;

                                    return (
                                        <li
                                            key={log.id}
                                            className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-muted/50"
                                        >
                                            <span
                                                className={cn(
                                                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                                    style.className
                                                )}
                                            >
                                                <StatusIcon className="h-4 w-4" />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {log.title}
                                                </p>

                                                <p className="truncate text-xs text-muted-foreground">
                                                    {log.body}
                                                </p>

                                                <p className="mt-1 text-[11px] text-muted-foreground/70">
                                                    {log.channel} · {timeAgo(log.createdAt)}
                                                </p>
                                            </div>

                                            <span
                                                className={cn(
                                                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                                    style.className
                                                )}
                                            >
                                                {style.label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-5 py-3 text-center">
                        <Link
                            href="/notifications"
                            onClick={() => setOpen(false)}
                            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                            Open notification center
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}