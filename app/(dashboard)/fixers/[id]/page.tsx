"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    FileText,
    Mail,
    MapPin,
    Phone,
    Star,
    User,
    Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Breadcrumb from "@/components/layout/breadcrumb";
import {
    approveFixer,
    banFixer,
    displayName,
    fetchFixerById,
    fetchFixerDocuments,
    fixerLocation,
    reactivateFixer,
    rejectFixer,
    suspendFixer,
} from "@/services/fixers";
import { fetchBookings } from "@/services/bookings";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import type { AdminFixer, FixerDocument, FixerMetrics } from "@/types/fixer";

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>

            <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>

                <p className="mt-0.5 text-sm font-medium">{value ?? "-"}</p>
            </div>
        </div>
    );
}

const verificationStyles: Record<string, string> = {
    verified:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    unverified:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function FixerDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [fixer, setFixer] = useState<AdminFixer | null>(null);
    const [metrics, setMetrics] = useState<FixerMetrics | null>(null);
    const [documents, setDocuments] = useState<FixerDocument[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        
        Promise.all([
            fetchFixerById(id),
            fetchFixerDocuments(id),
            fetchBookings({ fixerId: id, limit: 10 }),
        ])
            .then(([detail, docs, bookingData]) => {
                if (cancelled) return;
                setFixer(detail.fixer);
                setMetrics(detail.metrics);
                setDocuments(docs);
                setBookings(bookingData.items);
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
    }, [id]);

    async function handleAction(action: "approve" | "reject" | "suspend" | "ban") {
        if (!fixer) return;

        let reason: string | undefined;

        if (action === "approve") {
            reason = window.prompt("Reason (optional):") ?? undefined;
        } else {
            reason =
                window.prompt(`Reason for ${action}? (min 3 characters)`) ??
                undefined;

            if (!reason) return;
        }

        setActing(true);
        setError(null);

        try {
            if (action === "approve") {
                await approveFixer(fixer.id, reason);
                setFixer({ ...fixer, verificationStatus: "verified" });
            } else if (action === "reject") {
                await rejectFixer(fixer.id, reason!);
                setFixer({ ...fixer, verificationStatus: "unverified" });
            } else if (action === "suspend") {
                await suspendFixer(fixer.id, reason!);
                setFixer({ ...fixer, isActive: false });
            } else {
                await banFixer(fixer.id, reason!);
                setFixer({ ...fixer, isActive: false });
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    async function handleReactivate() {
        if (!fixer) return;

        setActing(true);
        setError(null);

        try {
            await reactivateFixer(fixer.id, "Reactivated from admin dashboard");
            setFixer({ ...fixer, isActive: true });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <p className="py-16 text-center text-sm text-muted-foreground">
                    Loading fixer...
                </p>
            </div>
        );
    }

    if (!fixer) {
        return (
            <div className="p-6">
                <Breadcrumb
                    items={[{ label: "Fixers", href: "/fixers" }, { label: id }]}
                />

                <div className="mt-8 rounded-2xl border bg-card p-16 text-center shadow-sm dark:bg-zinc-900">
                    <h1 className="text-2xl font-bold">Fixer not found</h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error ?? `No fixer exists with the ID ${id}.`}
                    </p>

                    <Link
                        href="/fixers"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to fixers
                    </Link>
                </div>
            </div>
        );
    }

    const name = displayName(fixer);
    const skills = fixer.skills?.length ? fixer.skills : [];

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb
                items={[{ label: "Fixers", href: "/fixers" }, { label: name }]}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                        {name}

                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${verificationStyles[fixer.verificationStatus] ?? verificationStyles.pending}`}
                        >
                            {fixer.verificationStatus}
                        </span>
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Joined {formatDate(fixer.createdAt)} ·{" "}
                        {fixer.availabilityStatus}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {fixer.verificationStatus === "pending" && (
                        <>
                            <button
                                onClick={() => handleAction("approve")}
                                disabled={acting}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => handleAction("reject")}
                                disabled={acting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                Reject
                            </button>
                        </>
                    )}

                    {fixer.isActive ? (
                        <>
                            <button
                                onClick={() => handleAction("suspend")}
                                disabled={acting}
                                className="rounded-lg border border-yellow-300 px-4 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-50 disabled:opacity-60"
                            >
                                Suspend
                            </button>

                            <button
                                onClick={() => handleAction("ban")}
                                disabled={acting}
                                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                Ban
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleReactivate}
                            disabled={acting}
                            className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                        >
                            Reactivate
                        </button>
                    )}

                    <Link
                        href="/fixers"
                        className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </div>
            </div>

            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">
                        Skills & Performance
                    </h2>

                    {skills.length > 0 && (
                        <div className="mb-5 flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                                >
                                    <Wrench className="h-3 w-3" />
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="rounded-xl border p-4">
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                Rating
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {Number(fixer.rating).toFixed(1)}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-muted-foreground">
                                Jobs Completed
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {fixer.completedJobs}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-muted-foreground">
                                Acceptance Rate
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {metrics?.acceptanceRate != null
                                    ? `${Math.round(metrics.acceptanceRate * 100)}%`
                                    : "-"}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-muted-foreground">
                                Completion Rate
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {metrics?.completionRate != null
                                    ? `${Math.round(metrics.completionRate * 100)}%`
                                    : "-"}
                            </p>
                        </div>
                    </div>

                    {fixer.bio && (
                        <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                            {fixer.bio}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">
                        Contact Information
                    </h2>

                    <div className="space-y-5">
                        <DetailRow icon={User} label="Name" value={name} />
                        <DetailRow
                            icon={Mail}
                            label="Email"
                            value={fixer.user?.email ?? undefined}
                        />
                        <DetailRow
                            icon={Phone}
                            label="Phone"
                            value={fixer.user?.phone ?? fixer.phone ?? undefined}
                        />
                        <DetailRow icon={MapPin} label="Location" value={fixerLocation(fixer)} />
                        <DetailRow icon={CalendarDays} label="Joined" value={formatDate(fixer.createdAt)} />
                        <DetailRow icon={Wrench} label="Trade" value={fixer.trade || undefined} />
                        <DetailRow
                            icon={BadgeCheck}
                            label="Service Category"
                            value={fixer.serviceCategory || undefined}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">
                        Verification Documents
                    </h2>

                    {documents.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No documents uploaded.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((document) => (
                                <div
                                    key={document.id}
                                    className="rounded-xl border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {document.documentType}
                                        </p>

                                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase">
                                            {document.status}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Uploaded {formatDate(document.createdAt)}
                                    </p>

                                    <a
                                        href={document.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        Open document
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Assigned Bookings</h2>

                        <Link
                            href="/bookings"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            View all bookings
                        </Link>
                    </div>

                    {bookings.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No bookings assigned to this fixer yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {bookings.map((booking) => (
                                <Link
                                    key={booking.id}
                                    href={`/bookings/${booking.id}`}
                                    className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted/50"
                                >
                                    <div>
                                        <p className="font-semibold">{booking.id}</p>

                                        <p className="text-sm text-muted-foreground">
                                            {booking.customer?.name ?? "-"} ·{" "}
                                            {booking.serviceName}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold">
                                            {formatCurrency(
                                                booking.finalPrice ?? booking.priceEstimate
                                            )}
                                        </p>

                                        <p className="text-xs uppercase text-muted-foreground">
                                            {booking.status.replace("_", " ")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
        </div>
    );
}
