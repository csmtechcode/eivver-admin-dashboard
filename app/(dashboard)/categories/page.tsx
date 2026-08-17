"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Pencil, Plus, Trash2, X } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    createCategory,
    deleteCategory,
    fetchCategories,
    updateCategory,
} from "@/services/categories";
import { getApiErrorMessage } from "@/lib/axios";
import type { Category } from "@/types/category";

interface FormState {
    id?: string;
    name: string;
    description: string;
}

const emptyForm: FormState = { name: "", description: "" };

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);

    function load() {

        fetchCategories()
            .then(setCategories)
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

    function openEdit(category: Category) {
        setForm({
            id: category.id,
            name: category.name,
            description: category.description ?? "",
        });
        setFormOpen(true);
    }

    async function handleSubmit() {
        if (!form.name.trim()) {
            setError("Category name is required.");
            return;
        }

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            if (form.id) {
                await updateCategory(form.id, {
                    name: form.name,
                    description: form.description || undefined,
                });
                setMessage("Category updated successfully.");
            } else {
                await createCategory({
                    name: form.name,
                    description: form.description || undefined,
                });
                setMessage("Category created successfully.");
            }

            setFormOpen(false);
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(category: Category) {
        if (
            !window.confirm(
                `Delete category "${category.name}"? Services in it will become uncategorized.`
            )
        ) {
            return;
        }

        setError(null);
        setMessage(null);

        try {
            await deleteCategory(category.id);
            setMessage("Category deleted.");
            load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Categories"
                    description="Organize services into categories"
                />

                <button
                    onClick={openCreate}
                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
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
                            {form.id ? "Edit Category" : "Add Category"}
                        </h2>

                        <button
                            onClick={() => setFormOpen(false)}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
                            aria-label="Close form"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium">
                            Name *
                        </span>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="e.g. Plumbing"
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary sm:max-w-md"
                        />
                    </label>

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
                            placeholder="Short description of this category..."
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
                    All Categories ({categories.length})
                </h2>

                {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        Loading categories...
                    </p>
                ) : categories.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No categories yet. Add one to get started.
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="rounded-xl border p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                                            <FolderOpen className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="font-semibold">
                                                {category.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(category)}
                                            className="rounded-lg border p-1.5 text-muted-foreground transition hover:bg-muted"
                                            aria-label={`Edit ${category.name}`}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(category)}
                                            className="rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                                            aria-label={`Delete ${category.name}`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {category.description && (
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {category.description}
                                    </p>
                                )}

                                {category.serviceCount != null && (
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        {category.serviceCount} services
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
