"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Download, Eye, Search, Star, UserCog, Users } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    displayName,
    exportFixersCsv,
    fetchFixerDashboardStats,
    fetchFixers,
    fixerLocation,
} from "@/services/fixers";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv } from "@/lib/utils";
import type { AdminFixer, AvailabilityStatus } from "@/types/fixer";

const verificationStyles: Record<string, string> = {
    verified:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    unverified:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const availabilityStyles: Record<AvailabilityStatus, string> = {
    online: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    offline: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
    busy: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

export default function FixersPage() {
    const [fixers, setFixers] = useState<AdminFixer[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<{
        totalFixers: number;
        pendingFixers: number;
        verifiedFixers: number;
        onlineFixers: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 400);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let cancelled = false;

        fetchFixers({ page, limit: 20, search: debouncedQuery })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setFixers(data.items);
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
    }, [page, debouncedQuery]);

    useEffect(() => {
        fetchFixerDashboardStats()
            .then((data) =>
                setStats({
                    totalFixers: data.totalFixers,
                    pendingFixers: data.pendingFixers,
                    verifiedFixers: data.verifiedFixers,
                    onlineFixers: data.onlineFixers,
                })
            )
            .catch(() => {});
    }, []);

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Fixers"
                description="Manage service professionals on the platform"
            >
                <button
                    onClick={async () => {
                        try {
                            const { filename, csv } = await exportFixersCsv();
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
                    icon={<UserCog className="h-5 w-5 text-blue-600" />}
                    label="Total Fixers"
                    value={stats ? stats.totalFixers.toLocaleString() : "-"}
                />

                <StatCard
                    icon={<Users className="h-5 w-5 text-emerald-600" />}
                    label="Online"
                    value={stats ? stats.onlineFixers.toLocaleString() : "-"}
                />

                <StatCard
                    icon={<BadgeCheck className="h-5 w-5 text-emerald-600" />}
                    label="Verified"
                    value={stats ? stats.verifiedFixers.toLocaleString() : "-"}
                />

                <StatCard
                    icon={<BadgeCheck className="h-5 w-5 text-yellow-600" />}
                    label="Pending Verification"
                    value={stats ? stats.pendingFixers.toLocaleString() : "-"}
                />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">
                        All Fixers ({total})
                    </h2>

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="search"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search fixers..."
                            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary sm:w-64"
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
                        Loading fixers...
                    </p>
                ) : fixers.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No fixers found.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {fixers.map((fixer) => {
                            const skills = fixer.skills?.length
                                ? fixer.skills.join(", ")
                                : fixer.trade || fixer.serviceCategory;

                            return (
                                <div
                                    key={fixer.id}
                                    className="rounded-xl border p-5 transition hover:bg-muted/50"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {displayName(fixer)}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {skills}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${availabilityStyles[fixer.availabilityStatus] ?? availabilityStyles.offline}`}
                                        >
                                            {fixer.availabilityStatus}
                                        </span>
                                    </div>

                                    <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1 font-medium text-foreground">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            {Number(fixer.rating).toFixed(1)}
                                        </span>

                                        <span>{fixer.completedJobs} jobs</span>

                                        <span>{fixerLocation(fixer)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${verificationStyles[fixer.verificationStatus] ?? verificationStyles.pending}`}
                                        >
                                            {fixer.verificationStatus}
                                        </span>

                                        <Link
                                            href={`/fixers/${fixer.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} fixers
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
