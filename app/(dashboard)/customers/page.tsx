"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Download, Eye, Search, ShieldAlert, Users } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    banCustomer,
    exportUsersCsv,
    fetchCustomers,
    fetchUserStats,
    reactivateCustomer,
    suspendCustomer,
} from "@/services/customers";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatDate } from "@/lib/utils";
import type { User } from "@/types/user";

const statusStyles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    suspended:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    banned: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<{
        customers: number;
        suspended: number;
        banned: number;
        newThisMonth: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 400);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let cancelled = false;

        fetchCustomers({
            page,
            limit: 20,
            search: debouncedQuery,
        })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setCustomers(data.items);
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
        fetchUserStats()
            .then((data) =>
                setStats({
                    customers: data.customers,
                    suspended: data.suspended,
                    banned: data.banned,
                    newThisMonth: data.newThisMonth,
                })
            )
            .catch(() => {});
    }, []);

    async function handleExport() {
        try {
            const { filename, csv } = await exportUsersCsv();
            downloadCsv(filename, csv);
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    async function handleSuspend(user: User) {
        const reason = window.prompt(
            `Reason for suspending ${user.email}? (min 3 characters)`
        );

        if (!reason) return;

        setActingId(user.id);
        setError(null);

        try {
            await suspendCustomer(user.id, reason);
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === user.id ? { ...c, accountStatus: "suspended" } : c
                )
            );
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleBan(user: User) {
        const reason = window.prompt(
            `Reason for banning ${user.email}? (min 3 characters)`
        );

        if (!reason) return;

        setActingId(user.id);
        setError(null);

        try {
            await banCustomer(user.id, reason);
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === user.id ? { ...c, accountStatus: "banned" } : c
                )
            );
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleReactivate(user: User) {
        setActingId(user.id);
        setError(null);

        try {
            await reactivateCustomer(user.id, "Reactivated from admin dashboard");
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === user.id ? { ...c, accountStatus: "active" } : c
                )
            );
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Customers"
                description="View and manage platform customers"
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
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    label="Total Customers"
                    value={stats ? stats.customers.toLocaleString() : "-"}
                />

                <StatCard
                    icon={<Users className="h-5 w-5 text-emerald-600" />}
                    label="New This Month"
                    value={stats ? stats.newThisMonth.toLocaleString() : "-"}
                />

                <StatCard
                    icon={<ShieldAlert className="h-5 w-5 text-yellow-600" />}
                    label="Suspended"
                    value={stats ? stats.suspended.toLocaleString() : "-"}
                />

                <StatCard
                    icon={<Ban className="h-5 w-5 text-red-600" />}
                    label="Banned"
                    value={stats ? stats.banned.toLocaleString() : "-"}
                />
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">
                        All Customers ({total})
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
                            placeholder="Search customers..."
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
                        Loading customers...
                    </p>
                ) : customers.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No customers found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Customer</th>
                                    <th className="pb-3 pr-4 font-medium">Phone</th>
                                    <th className="pb-3 pr-4 font-medium">Joined</th>
                                    <th className="pb-3 pr-4 font-medium">Verified</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 font-medium" />
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {customers.map((customer) => {
                                    const name =
                                        customer.name ??
                                        [customer.firstName, customer.lastName]
                                            .filter(Boolean)
                                            .join(" ");

                                    return (
                                        <tr
                                            key={customer.id}
                                            className="transition hover:bg-muted/50"
                                        >
                                            <td className="py-4 pr-4">
                                                <p className="font-semibold">
                                                    {name || "—"}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {customer.email}
                                                </p>
                                            </td>

                                            <td className="py-4 pr-4 text-muted-foreground">
                                                {customer.phone ?? "-"}
                                            </td>

                                            <td className="py-4 pr-4 text-muted-foreground">
                                                {formatDate(customer.createdAt)}
                                            </td>

                                            <td className="py-4 pr-4">
                                                {customer.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[customer.accountStatus] ?? statusStyles.active}`}
                                                >
                                                    {customer.accountStatus}
                                                </span>
                                            </td>

                                            <td className="py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View
                                                    </Link>

                                                    {customer.accountStatus === "active" ? (
                                                        <button
                                                            onClick={() => handleSuspend(customer)}
                                                            disabled={actingId === customer.id}
                                                            className="rounded-lg border border-yellow-300 px-3 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-50 disabled:opacity-60"
                                                        >
                                                            Suspend
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleReactivate(customer)}
                                                            disabled={actingId === customer.id}
                                                            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                                                        >
                                                            Reactivate
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleBan(customer)}
                                                        disabled={actingId === customer.id}
                                                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                                    >
                                                        Ban
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} customers
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
