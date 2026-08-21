"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    createAdmin,
    deleteAdmin,
    fetchAdmins,
    updateAdminStatus,
    type CreateAdminPayload,
} from "@/services/admins";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";

const statusStyles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    suspended: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    banned: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function AdminsPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateAdminPayload>({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchAdmins({ page, limit: 20 })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setAdmins(data.items);
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
    }, [page]);

    async function handleSubmit() {
        if (
            !form.email.trim() ||
            !form.firstName.trim() ||
            !form.lastName.trim() ||
            !form.password
        ) {
            setFormError("All fields are required.");
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const created = await createAdmin(form);
            setAdmins((prev) => [created, ...prev]);
            setTotal((t) => t + 1);
            setShowForm(false);
        } catch (err) {
            setFormError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleStatus(admin: AdminUser) {
        if (admin.accountStatus === "active") {
            const reason = window.prompt("Reason for suspending this admin (min 3 chars):");
            if (!reason || reason.length < 3) return;

            setActingId(admin.id);
            setError(null);

            try {
                await updateAdminStatus(admin.id, { action: "suspend", reason });
                setAdmins((prev) =>
                    prev.map((a) => (a.id === admin.id ? { ...a, accountStatus: "suspended" as const } : a))
                );
            } catch (err) {
                setError(getApiErrorMessage(err));
            } finally {
                setActingId(null);
            }
        } else {
            setActingId(admin.id);
            setError(null);

            try {
                await updateAdminStatus(admin.id, { action: "activate" });
                setAdmins((prev) =>
                    prev.map((a) => (a.id === admin.id ? { ...a, accountStatus: "active" as const } : a))
                );
            } catch (err) {
                setError(getApiErrorMessage(err));
            } finally {
                setActingId(null);
            }
        }
    }

    async function handleDelete(admin: AdminUser) {
        if (!window.confirm(`Delete admin account for ${admin.email}?`)) return;

        setActingId(admin.id);
        setError(null);

        try {
            await deleteAdmin(admin.id);
            setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
            setTotal((t) => t - 1);
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
                title="Admin Accounts"
                description="Manage who has access to the admin dashboard"
            >
                <button
                    onClick={() => {
                        setForm({ email: "", firstName: "", lastName: "", password: "" });
                        setFormError(null);
                        setShowForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Admin
                </button>
            </PageHeader>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-semibold">All Admins ({total})</h2>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading admins...
                    </p>
                ) : admins.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No admin accounts found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Admin</th>
                                    <th className="pb-3 pr-4 font-medium">Role</th>
                                    <th className="pb-3 pr-4 font-medium">Joined</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 font-medium" />
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {admins.map((admin) => {
                                    const name =
                                        admin.name ??
                                        [admin.firstName, admin.lastName].filter(Boolean).join(" ");

                                    return (
                                        <tr key={admin.id} className="transition hover:bg-muted/50">
                                            <td className="py-4 pr-4">
                                                <p className="font-semibold">{name || "—"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {admin.email}
                                                </p>
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    {admin.role}
                                                </span>
                                            </td>

                                            <td className="py-4 pr-4 text-muted-foreground">
                                                {formatDate(admin.createdAt)}
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[admin.accountStatus] ?? statusStyles.active}`}
                                                >
                                                    {admin.accountStatus}
                                                </span>
                                            </td>

                                            <td className="py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatus(admin)}
                                                        disabled={actingId === admin.id}
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-60 ${
                                                            admin.accountStatus === "active"
                                                                ? "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                        }`}
                                                    >
                                                        {admin.accountStatus === "active"
                                                            ? "Suspend"
                                                            : "Activate"}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(admin)}
                                                        disabled={actingId === admin.id}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Delete
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
                        Page {page} of {totalPages} · {total} admins
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

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl dark:bg-zinc-900">
                        <h3 className="mb-4 text-lg font-semibold">Create Admin Account</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Email</label>

                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, email: e.target.value }))
                                    }
                                    placeholder="admin@eivver.com"
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        First name
                                    </label>

                                    <input
                                        value={form.firstName}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, firstName: e.target.value }))
                                        }
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Last name
                                    </label>

                                    <input
                                        value={form.lastName}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, lastName: e.target.value }))
                                        }
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, password: e.target.value }))
                                    }
                                    placeholder="Min 8 chars, upper + lower + digit"
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {formError && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {formError}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                                >
                                    {saving ? "Creating..." : "Create Admin"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}