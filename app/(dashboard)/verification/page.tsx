"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, Eye, XCircle } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/layout/page-header";
import {
    approveFixer,
    displayName,
    fetchPendingFixers,
    rejectFixer,
} from "@/services/fixers";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { AdminFixer } from "@/types/fixer";

export default function VerificationPage() {
    const [fixers, setFixers] = useState<AdminFixer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function load() {

        fetchPendingFixers()
            .then((data) => {
                setError(null);
                setFixers(data.items);
            })
            .catch((err) => setError(getApiErrorMessage(err)))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
    }, []);

    async function handleApprove(fixer: AdminFixer) {
        const reason =
            window.prompt("Reason (optional):") ?? undefined;

        setActingId(fixer.id);
        setError(null);

        try {
            await approveFixer(fixer.id, reason);
            setFixers((prev) => prev.filter((f) => f.id !== fixer.id));
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleReject(fixer: AdminFixer) {
        const reason = window.prompt("Reason for rejection? (min 3 characters)");

        if (!reason) return;

        setActingId(fixer.id);
        setError(null);

        try {
            await rejectFixer(fixer.id, reason);
            setFixers((prev) => prev.filter((f) => f.id !== fixer.id));
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Verification"
                description="Review and approve fixer identity documents"
            />

            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-semibold">
                    Pending Applications ({fixers.length})
                </h2>

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading verification queue...
                    </p>
                ) : fixers.length === 0 ? (
                    <div className="py-16 text-center">
                        <BadgeCheck className="mx-auto h-10 w-10 text-emerald-500" />

                        <p className="mt-4 text-sm font-medium">
                            All caught up!
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            No fixers are waiting for verification.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {fixers.map((fixer) => (
                            <div
                                key={fixer.id}
                                className="rounded-xl border p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {displayName(fixer)}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {fixer.user?.email ?? "-"} ·{" "}
                                            {fixer.serviceCategory ?? fixer.trade ?? "No category"} ·{" "}
                                            Applied {formatDate(fixer.createdAt)}
                                        </p>

                                        {fixer.bio && (
                                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                                {fixer.bio}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <Link
                                            href={`/fixers/${fixer.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Review
                                        </Link>

                                        <button
                                            onClick={() => handleReject(fixer)}
                                            disabled={actingId === fixer.id}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </button>

                                        <button
                                            onClick={() => handleApprove(fixer)}
                                            disabled={actingId === fixer.id}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}