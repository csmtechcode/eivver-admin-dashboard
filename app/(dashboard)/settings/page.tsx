"use client";

import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import { fetchSettings, updateSettings } from "@/services/settings";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";
import type { PlatformSettings } from "@/types/dashboard";

const emptySettings: PlatformSettings = {
    platformName: "",
    supportEmail: "",
    supportPhone: "",
    currency: "",
    serviceFeePercent: 0,
    maintenanceMode: false,
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings>(emptySettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        
        fetchSettings()
            .then((data) => {
                if (!cancelled) setSettings({ ...emptySettings, ...data });
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
    }, []);

    async function handleSave() {
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const updated = await updateSettings({
                platformName: settings.platformName,
                supportEmail: settings.supportEmail,
                supportPhone: settings.supportPhone,
                currency: settings.currency,
                serviceFeePercent: Number(settings.serviceFeePercent) || 0,
                maintenanceMode: settings.maintenanceMode,
            });

            setSettings({ ...emptySettings, ...updated });
            setMessage("Settings saved successfully.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <p className="py-16 text-center text-sm text-muted-foreground">
                    Loading settings...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Settings"
                description="Manage platform-wide configuration"
            />

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

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">
                        General Information
                    </h2>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium">
                            Platform Name
                        </span>

                        <input
                            value={settings.platformName}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    platformName: e.target.value,
                                })
                            }
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <label className="mt-4 block">
                        <span className="mb-1 block text-sm font-medium">
                            Support Email
                        </span>

                        <input
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    supportEmail: e.target.value,
                                })
                            }
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <label className="mt-4 block">
                        <span className="mb-1 block text-sm font-medium">
                            Support Phone
                        </span>

                        <input
                            value={settings.supportPhone}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    supportPhone: e.target.value,
                                })
                            }
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <label className="mt-4 block">
                        <span className="mb-1 block text-sm font-medium">
                            Currency
                        </span>

                        <input
                            value={settings.currency}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    currency: e.target.value,
                                })
                            }
                            placeholder="e.g. NGN"
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="mb-6 text-lg font-semibold">
                        Fees & Maintenance
                    </h2>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium">
                            Service Fee / Commission (%)
                        </span>

                        <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={settings.serviceFeePercent}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    serviceFeePercent: Number(e.target.value),
                                })
                            }
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <div className="mt-4 rounded-xl bg-muted p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            Commission Preview
                        </div>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground">On a {formatCurrency(10000)} job:</p>
                                <p className="font-medium">Platform keeps: {formatCurrency(10000 * settings.serviceFeePercent / 100)}</p>
                                <p className="font-medium">Fixer receives: {formatCurrency(10000 * (1 - settings.serviceFeePercent / 100))}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">On a {formatCurrency(50000)} job:</p>
                                <p className="font-medium">Platform keeps: {formatCurrency(50000 * settings.serviceFeePercent / 100)}</p>
                                <p className="font-medium">Fixer receives: {formatCurrency(50000 * (1 - settings.serviceFeePercent / 100))}</p>
                            </div>
                        </div>
                    </div>

                    <label className="mt-6 flex cursor-pointer items-center justify-between rounded-xl border p-4">
                        <div>
                            <p className="text-sm font-medium">Maintenance Mode</p>

                            <p className="text-xs text-muted-foreground">
                                Temporarily disable customer-facing features
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    maintenanceMode: e.target.checked,
                                })
                            }
                            className="h-5 w-5 accent-blue-600"
                        />
                    </label>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}