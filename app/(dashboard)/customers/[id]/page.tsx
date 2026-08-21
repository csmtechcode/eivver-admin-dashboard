"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    History,
    Mail,
    MapPin,
    Phone,
    ShieldAlert,
    User as UserIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Breadcrumb from "@/components/layout/breadcrumb";
import {
    banCustomer,
    fetchCustomerById,
    fetchUserActivity,
    forceLogoutUser,
    reactivateCustomer,
    resetUserPassword,
    suspendCustomer,
} from "@/services/customers";
import { fetchBookings } from "@/services/bookings";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { User } from "@/types/user";
import type { Booking } from "@/types/booking";

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

export default function CustomerDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [customer, setCustomer] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activity, setActivity] = useState<
        Array<{
            id: string;
            domain: string;
            action: string;
            fromState: string | null;
            toState: string | null;
            reason: string | null;
            createdAt: string;
        }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            fetchCustomerById(id),
            fetchBookings({ customerId: id, limit: 10 }),
            fetchUserActivity(id, { limit: 10 }),
        ])
            .then(([detail, bookingData, activityData]) => {
                if (cancelled) return;
                setCustomer(detail.user);
                setBookings(bookingData.items);
                setActivity(activityData.activity ?? []);
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

    async function handleSuspend() {
        if (!customer) return;

        const reason = window.prompt("Reason for suspending this customer?");

        if (!reason) return;

        setActing(true);
        setError(null);

        try {
            await suspendCustomer(customer.id, reason);
            setCustomer({ ...customer, accountStatus: "suspended" });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    async function handleBan() {
        if (!customer) return;

        const reason = window.prompt("Reason for banning this customer?");

        if (!reason) return;

        setActing(true);
        setError(null);

        try {
            await banCustomer(customer.id, reason);
            setCustomer({ ...customer, accountStatus: "banned" });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    async function handleReactivate() {
        if (!customer) return;

        setActing(true);
        setError(null);

        try {
            await reactivateCustomer(customer.id, "Reactivated from admin dashboard");
            setCustomer({ ...customer, accountStatus: "active" });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    async function handleResetPassword() {
        if (!customer) return;

        const newPassword = window.prompt(
            "New password (min 8 chars, must include upper, lower, and digit):"
        );

        if (!newPassword) return;

        setActing(true);
        setError(null);

        try {
            await resetUserPassword(customer.id, newPassword);
            window.alert("Password reset successfully.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActing(false);
        }
    }

    async function handleForceLogout() {
        if (!customer) return;

        if (!window.confirm(`Log ${customer.email} out of all devices?`)) return;

        setActing(true);
        setError(null);

        try {
            await forceLogoutUser(customer.id);
            window.alert("User logged out of all active sessions.");
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
                    Loading customer...
                </p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-6">
                <Breadcrumb
                    items={[{ label: "Customers", href: "/customers" }, { label: id }]}
                />

                <div className="mt-8 rounded-2xl border bg-card p-16 text-center shadow-sm dark:bg-zinc-900">
                    <h1 className="text-2xl font-bold">Customer not found</h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error ?? `No customer exists with the ID ${id}.`}
                    </p>

                    <Link
                        href="/customers"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to customers
                    </Link>
                </div>
            </div>
        );
    }

    const name =
        customer.name ??
        [customer.firstName, customer.lastName].filter(Boolean).join(" ");

    const location = customer.fixerProfile?.location
        ? [
              customer.fixerProfile.location.city,
              customer.fixerProfile.location.state,
              customer.fixerProfile.location.country,
          ]
              .filter(Boolean)
              .join(", ")
        : undefined;

    const revenue = bookings.reduce(
        (sum, booking) => sum + (booking.finalPrice ?? booking.priceEstimate ?? 0),
        0
    );

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb
                items={[
                    { label: "Customers", href: "/customers" },
                    { label: name || id },
                ]}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{name || "—"}</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Joined {formatDate(customer.createdAt)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleResetPassword}
                        disabled={acting}
                        className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                    >
                        Reset Password
                    </button>

                    <button
                        onClick={handleForceLogout}
                        disabled={acting}
                        className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                    >
                        Force Logout
                    </button>

                    {customer.accountStatus === "active" ? (
                        <>
                            <button
                                onClick={handleSuspend}
                                disabled={acting}
                                className="rounded-lg border border-yellow-300 px-4 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-50 disabled:opacity-60"
                            >
                                Suspend
                            </button>

                            <button
                                onClick={handleBan}
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
                        href="/customers"
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
                    <h2 className="mb-6 text-lg font-semibold">Contact Information</h2>

                    <div className="space-y-5">
                        <DetailRow icon={UserIcon} label="Name" value={name} />
                        <DetailRow icon={Mail} label="Email" value={customer.email} />
                        <DetailRow icon={Phone} label="Phone" value={customer.phone ?? undefined} />
                        <DetailRow icon={MapPin} label="Location" value={location} />
                        <DetailRow icon={CalendarDays} label="Joined" value={formatDate(customer.createdAt)} />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">Activity</h2>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-muted-foreground">
                                Recent Bookings
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {bookings.length}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-muted-foreground">
                                Booked Value (recent)
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {formatCurrency(revenue)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">Account Status</h2>

                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            customer.accountStatus === "active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                : customer.accountStatus === "suspended"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                        }`}
                    >
                        {customer.accountStatus}
                    </span>

                    <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldAlert className="h-4 w-4" />
                        {customer.accountStatus === "active"
                            ? "This customer can use the platform normally."
                            : `This account is ${customer.accountStatus}.`}
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <History className="h-4 w-4 text-muted-foreground" />
                        Audit Activity
                    </h2>
                </div>

                {activity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No recorded activity for this account yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {activity.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {entry.action.replace(/_/g, " ").toLowerCase()}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {entry.domain} ·{" "}
                                        {entry.fromState ?? "—"} → {entry.toState ?? "—"}
                                        {entry.reason ? ` · "${entry.reason}"` : ""}
                                    </p>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {formatDateTime(entry.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <History className="h-4 w-4 text-muted-foreground" />
                        Recent Bookings
                    </h2>

                    <Link
                        href="/bookings"
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        View all bookings
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No bookings found for this customer.
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
                                        {booking.serviceName} ·{" "}
                                        {booking.scheduledFor
                                            ? formatDate(booking.scheduledFor)
                                            : "Not scheduled"}
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
