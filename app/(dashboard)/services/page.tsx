"use client";

import { useEffect, useState } from "react";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    createService,
    deleteService,
    fetchServices,
    updateService,
} from "@/services/services";
import { fetchCategories } from "@/services/categories";
import { getApiErrorMessage } from "@/lib/axios";
import type { Service } from "@/types/service";
import type { Category } from "@/types/category";

interface FormState {
    id?: string;
    name: string;
    description: string;
    categoryId: string;
}

const emptyForm: FormState = { name: "", description: "", categoryId: "" };

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);

    function load() {

        Promise.all([fetchServices(), fetchCategories()])
            .then(([serviceList, categoryList]) => {
                setServices(serviceList);
                setCategories(categoryList);
            })
            .catch((err) => setError(getApiErrorMessage(err)))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setForm(emptyForm);
        setFormOpen(true);
    }

    function openEdit(service: Service) {
        setForm({
            id: service.id,
            name: service.name,
            description: service.description ?? "",
            categoryId: service.categoryId ?? "",
        });
        setFormOpen(true);
    }

    async function handleSubmit() {
        if (!form.name.trim()) {
            setError("Service name is required.");
            return;
        }

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            if (form.id) {
                await updateService(form.id, {
                    name: form.name,
                    description: form.description || undefined,
                    categoryId: form.categoryId || undefined,
                });
                setMessage("Service updated successfully.");
            } else {
                await createService({
                    name: form.name,
                    description: form.description || undefined,
                    categoryId: form.categoryId,
                });
                setMessage("Service created successfully.");
            }

            setFormOpen(false);
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(service: Service) {
        if (
            !window.confirm(
                `Delete service "${service.name}"? This cannot be undone.`
            )
        ) {
            return;
        }

        setError(null);
        setMessage(null);

        try {
            await deleteService(service.id);
            setMessage("Service deleted.");
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Services"
                    description="Manage the services offered on the platform"
                />

                <button
                    onClick={openCreate}
                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Service
                </button>
            </div>

            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {message && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {message}
                </p>
            )}

            {formOpen && (
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            {form.id ? "Edit Service" : "Add Service"}
                        </h2>

                        <button
                            onClick={() => setFormOpen(false)}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
                            aria-label="Close form"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium">
                                Name *
                            </span>

                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="e.g. Plumbing Repair"
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium">
                                Category
                            </span>

                            <select
                                value={form.categoryId}
                                onChange={(e) =>
                                    setForm({ ...form, categoryId: e.target.value })
                                }
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                            >
                                <option value="">No category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="mt-4 block">
                        <span className="mb-1 block text-sm font-medium">
                            Description
                        </span>

                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            rows={3}
                            placeholder="Short description of this service..."
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => setFormOpen(false)}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-semibold">
                    All Services ({services.length})
                </h2>

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading services...
                    </p>
                ) : services.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No services yet. Add one to get started.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="flex items-center justify-between rounded-xl border p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="font-semibold">{service.name}</p>

                                        <p className="text-sm text-muted-foreground">
                                            {service.categoryName ?? "Uncategorized"}
                                        </p>

                                        {service.description && (
                                            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                                                {service.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <button
                                        onClick={() => openEdit(service)}
                                        className="rounded-lg border p-2 text-muted-foreground transition hover:bg-muted"
                                        aria-label={`Edit ${service.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(service)}
                                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                        aria-label={`Delete ${service.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
