"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CircleCheck,
    CircleDashed,
    Clock,
    MapPin,
    Phone,
    RefreshCcw,
    User,
    Wrench,
    XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Breadcrumb from "@/components/layout/breadcrumb";
import {
    fetchBookingById,
    forceCancelBooking,
    reassignBookingFixer,
} from "@/services/bookings";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types/booking";

const statusStyles: Record<string, string> = {
    pending:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    accepted:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    on_the_way:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    arrived:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    in_progress:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    completed:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    closed:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
    cancelled:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    rejected:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

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

export default function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        
        fetchBookingById(id)
            .then((data) => {
                if (!cancelled) setBooking(data);
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

    async function handleCancel() {
        if (!booking) return;

        const reason = window.prompt("Reason for cancelling this booking?");

        if (!reason) return;

        setActing(true);
        setError(null);

        try {
            const updated = await forceCancelBooking(booking.id, reason);
            setBooking(updated);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    async function handleReassign() {
        if (!booking) return;

        const newFixerId = window.prompt("Enter the new fixer ID to assign:");
        const reason = window.prompt("Reason for reassignment:");

        if (!newFixerId || !reason) return;

        setActing(true);
        setError(null);

        try {
            const updated = await reassignBookingFixer(booking.id, newFixerId, reason);
            setBooking(updated);
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
                    Loading booking...
                </p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-6">
                <Breadcrumb
                    items={[{ label: "Bookings", href: "/bookings" }, { label: id }]}
                />

                <div className="mt-8 rounded-2xl border bg-card p-16 text-center shadow-sm dark:bg-zinc-900">
                    <h1 className="text-2xl font-bold">Booking not found</h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error ?? `No booking exists with the ID ${id}.`}
                    </p>

                    <Link
                        href="/bookings"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to bookings
                    </Link>
                </div>
            </div>
        );
    }

    const timeline: Array<{ label: string; time: string | null; done: boolean }> = [
        { label: "Booking created", time: booking.createdAt, done: true },
        { label: "Accepted by fixer", time: booking.acceptedAt, done: !!booking.acceptedAt },
        { label: "Work started", time: booking.startedAt, done: !!booking.startedAt },
        { label: "Completed", time: booking.completedAt, done: !!booking.completedAt },
    ];

    const canCancel =
        !["completed", "cancelled", "closed", "rejected"].includes(booking.status);

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb
                items={[{ label: "Bookings", href: "/bookings" }, { label: id }]}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{booking.id}</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {booking.serviceName} · Created {formatDate(booking.createdAt)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[booking.status] ?? statusStyles.pending}`}
                    >
                        {booking.status.replace("_", " ")}
                    </span>

                    {canCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={acting}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                            <XCircle className="h-4 w-4" />
                            Force Cancel
                        </button>
                    )}

                    {canCancel && booking.fixer && (
                        <button
                            onClick={handleReassign}
                            disabled={acting}
                            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Reassign Fixer
                        </button>
                    )}

                    <Link
                        href="/bookings"
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
                    <h2 className="mb-6 text-lg font-semibold">Booking Details</h2>

                    <div className="space-y-5">
                        <DetailRow icon={CalendarDays} label="Scheduled For" value={booking.scheduledFor ? formatDate(booking.scheduledFor) : undefined} />
                        <DetailRow icon={MapPin} label="Address" value={booking.address ?? undefined} />
                        <DetailRow icon={Wrench} label="Service" value={booking.serviceName} />
                        <DetailRow
                            icon={Clock}
                            label="Price Estimate"
                            value={formatCurrency(booking.priceEstimate)}
                        />
                        <DetailRow
                            icon={CircleCheck}
                            label="Final Price"
                            value={booking.finalPrice ? formatCurrency(booking.finalPrice) : undefined}
                        />
                        <DetailRow
                            icon={AlertTriangle}
                            label="Emergency"
                            value={booking.isEmergency ? "Yes" : "No"}
                        />
                        <DetailRow
                            icon={CircleDashed}
                            label="Recurring"
                            value={booking.isRecurring ? "Yes" : "No"}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">Parties</h2>

                    <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                        Customer
                    </p>

                    <div className="space-y-4">
                        <DetailRow
                            icon={User}
                            label="Name"
                            value={booking.customer?.name ?? "-"}
                        />
                        <DetailRow
                            icon={Phone}
                            label="Phone"
                            value={booking.customer?.phoneNumber ?? undefined}
                        />
                    </div>

                    <p className="mb-3 mt-8 text-xs uppercase tracking-wider text-muted-foreground">
                        Fixer
                    </p>

                    {booking.fixer ? (
                        <div className="space-y-4">
                            <DetailRow
                                icon={User}
                                label="Name"
                                value={booking.fixer.user?.name ?? "-"}
                            />
                            <DetailRow
                                icon={Phone}
                                label="Phone"
                                value={booking.fixer.user?.phoneNumber ?? undefined}
                            />
                            <DetailRow
                                icon={Wrench}
                                label="Service Category"
                                value={booking.fixer.serviceCategory ?? undefined}
                            />
                            <DetailRow
                                icon={CircleCheck}
                                label="Rating"
                                value={Number(booking.fixer.rating).toFixed(1)}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No fixer assigned yet.
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">Timeline</h2>

                    <div className="space-y-0">
                        {timeline.map((step, index) => (
                            <div key={step.label} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <span
                                        className={`mt-1 h-3 w-3 rounded-full ${step.done ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
                                    />
                                    {index < timeline.length - 1 && (
                                        <span
                                            className={`w-px flex-1 ${step.done ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                                        />
                                    )}
                                </div>

                                <div className="pb-6">
                                    <p
                                        className={`text-sm font-medium ${step.done ? "" : "text-muted-foreground"}`}
                                    >
                                        {step.label}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {step.time ? formatDate(step.time) : "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(booking.cancellationReason ||
                        booking.rejectionReason ||
                        booking.rescheduleReason) && (
                        <div className="mt-2 space-y-3 rounded-xl bg-muted p-4 text-sm">
                            {booking.cancellationReason && (
                                <p>
                                    <strong>Cancelled:</strong> {booking.cancellationReason}
                                </p>
                            )}
                            {booking.rejectionReason && (
                                <p>
                                    <strong>Rejected:</strong> {booking.rejectionReason}
                                </p>
                            )}
                            {booking.rescheduleReason && (
                                <p>
                                    <strong>Rescheduled:</strong> {booking.rescheduleReason}
                                </p>
                            )}
                        </div>
                    )}

                    {booking.completionNotes && (
                        <p className="mt-4 rounded-xl bg-muted p-4 text-sm">
                            <strong>Completion notes:</strong> {booking.completionNotes}
                        </p>
                    )}

                    {booking.notes && (
                        <p className="mt-4 rounded-xl bg-muted p-4 text-sm">
                            <strong>Customer notes:</strong> {booking.notes}
                        </p>
                    )}
                </div>
            </div>

            {booking.images.length > 0 && (
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-4 text-lg font-semibold">
                        Booking Images ({booking.images.length})
                    </h2>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {booking.images.map((image) => (
                            <a
                                key={image.id}
                                href={image.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square overflow-hidden rounded-xl border"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image.imageUrl}
                                    alt={booking.id}
                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
