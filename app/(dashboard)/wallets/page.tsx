"use client";

import { useEffect, useState } from "react";
import { Download, Wallet as WalletIcon } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import { exportFinancialCsv, fetchWallets } from "@/services/financial";
import { getApiErrorMessage } from "@/lib/axios";
import { downloadCsv, formatDate, formatKobo } from "@/lib/utils";
import type { Wallet } from "@/types/admin";

export default function WalletsPage() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

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

        fetchWallets({ page, limit: 20, search: debouncedQuery })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setWallets(data.items);
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

    async function handleExport() {
        try {
            const { filename, csv } = await exportFinancialCsv("wallets");
            downloadCsv(filename, csv);
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Wallets"
                description="Customer and fixer wallet balances across the platform"
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
                    <h2 className="text-lg font-semibold">All Wallets ({total})</h2>

                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by name or email..."
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary sm:w-64"
                    />
                </div>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading wallets...
                    </p>
                ) : wallets.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No wallets found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Owner</th>
                                    <th className="pb-3 pr-4 font-medium">Role</th>
                                    <th className="pb-3 pr-4 font-medium">Balance</th>
                                    <th className="pb-3 pr-4 font-medium">Currency</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Created</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {wallets.map((wallet) => {
                                    const owner = wallet.user;
                                    const name = owner
                                        ? owner.name ??
                                          [owner.firstName, owner.lastName]
                                              .filter(Boolean)
                                              .join(" ")
                                        : wallet.userId.slice(0, 8);

                                    return (
                                        <tr key={wallet.id} className="transition hover:bg-muted/50">
                                            <td className="py-4 pr-4">
                                                <p className="flex items-center gap-1.5 font-semibold">
                                                    <WalletIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {name || "—"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {owner?.email ?? ""}
                                                </p>
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                    {owner?.role ?? "user"}
                                                </span>
                                            </td>

                                            <td className="py-4 pr-4 font-semibold">
                                                {formatKobo(wallet.balanceKobo)}
                                            </td>

                                            <td className="py-4 pr-4 uppercase text-muted-foreground">
                                                {wallet.currency}
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                                                        wallet.isActive
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300"
                                                    }`}
                                                >
                                                    {wallet.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="py-4 text-muted-foreground">
                                                {formatDate(wallet.createdAt)}
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
                        Page {page} of {totalPages} · {total} wallets
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