"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    createBanner,
    deleteBanner,
    fetchBanners,
    updateBanner,
    type BannerPayload,
} from "@/services/banners";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { Banner, BannerAudience, BannerType } from "@/types/admin";

const typeStyles: Record<BannerType, string> = {
    info: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    emergency: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    promo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState<Banner | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<BannerPayload>({
        title: "",
        message: "",
        type: "info",
        audience: "all",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetchBanners({ page, limit: 20 })
            .then((data) => {
                if (cancelled) return;
                setError(null);
                setBanners(data.items);
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

    function openCreate() {
        setEditing(null);
        setForm({ title: "", message: "", type: "info", audience: "all" });
        setFormError(null);
        setShowForm(true);
    }

    function openEdit(banner: Banner) {
        setEditing(banner);
        setForm({
            title: banner.title,
            message: banner.message,
            type: banner.type,
            audience: banner.audience,
            startsAt: banner.startsAt ?? undefined,
            endsAt: banner.endsAt ?? undefined,
        });
        setFormError(null);
        setShowForm(true);
    }

    async function handleSubmit() {
        if (!form.title.trim() || !form.message.trim()) {
            setFormError("Title and message are required.");
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            if (editing) {
                const updated = await updateBanner(editing.id, form);
                setBanners((prev) =>
                    prev.map((b) => (b.id === updated.id ? updated : b))
                );
            } else {
                const created = await createBanner(form);
                setBanners((prev) => [created, ...prev]);
                setTotal((t) => t + 1);
            }

            setShowForm(false);
        } catch (err) {
            setFormError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle(banner: Banner) {
        setActingId(banner.id);
        setError(null);

        try {
            const updated = await updateBanner(banner.id, { isActive: !banner.isActive });
            setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActingId(null);
        }
    }

    async function handleDelete(banner: Banner) {
        if (!window.confirm(`Delete banner "${banner.title}"?`)) return;

        setActingId(banner.id);
        setError(null);

        try {
            await deleteBanner(banner.id);
            setBanners((prev) => prev.filter((b) => b.id !== banner.id));
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
                title="Announcement Banners"
                description="Create in-app announcements shown to users"
            >
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Banner
                </button>
            </PageHeader>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-semibold">All Banners ({total})</h2>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading banners...
                    </p>
                ) : banners.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No banners yet. Create your first announcement.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className={`rounded-xl border p-5 ${banner.isActive ? "" : "opacity-60"}`}
                            >
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Megaphone className="h-4 w-4 text-primary" />

                                        <h3 className="font-semibold">{banner.title}</h3>
                                    </div>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${typeStyles[banner.type]}`}
                                    >
                                        {banner.type}
                                    </span>
                                </div>

                                <p className="mb-3 text-sm text-muted-foreground">
                                    {banner.message}
                                </p>

                                <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="rounded-full bg-muted px-2.5 py-1">
                                        Audience: {banner.audience}
                                    </span>

                                    <span className="rounded-full bg-muted px-2.5 py-1">
                                        {banner.isActive ? "Active" : "Inactive"}
                                    </span>

                                    <span className="rounded-full bg-muted px-2.5 py-1">
                                        Created {formatDate(banner.createdAt)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleToggle(banner)}
                                        disabled={actingId === banner.id}
                                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-60"
                                    >
                                        {banner.isActive ? "Deactivate" : "Activate"}
                                    </button>

                                    <button
                                        onClick={() => openEdit(banner)}
                                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(banner)}
                                        disabled={actingId === banner.id}
                                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages} · {total} banners
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
                        <h3 className="mb-4 text-lg font-semibold">
                            {editing ? "Edit Banner" : "New Banner"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Title
                                </label>

                                <input
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, title: e.target.value }))
                                    }
                                    maxLength={200}
                                    placeholder="e.g. Scheduled maintenance this weekend"
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Message
                                </label>

                                <textarea
                                    value={form.message}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, message: e.target.value }))
                                    }
                                    rows={3}
                                    placeholder="Announcement text shown to users"
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Type
                                    </label>

                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                type: e.target.value as BannerType,
                                            }))
                                        }
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="emergency">Emergency</option>
                                        <option value="promo">Promo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Audience
                                    </label>

                                    <select
                                        value={form.audience}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                audience: e.target.value as BannerAudience,
                                            }))
                                        }
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="customers">Customers</option>
                                        <option value="fixers">Fixers</option>
                                        <option value="admins">Admins</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Starts at (optional)
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={form.startsAt?.slice(0, 16) ?? ""}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                startsAt: e.target.value
                                                    ? new Date(e.target.value).toISOString()
                                                    : undefined,
                                            }))
                                        }
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Ends at (optional)
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={form.endsAt?.slice(0, 16) ?? ""}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                endsAt: e.target.value
                                                    ? new Date(e.target.value).toISOString()
                                                    : undefined,
                                            }))
                                        }
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                    />
                                </div>
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
                                    {saving ? "Saving..." : editing ? "Save Changes" : "Create Banner"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}