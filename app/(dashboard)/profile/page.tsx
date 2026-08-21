"use client";

import { useEffect, useState } from "react";
import {
    Bell,
    KeyRound,
    Lock,
    Mail,
    Phone,
    Save,
    Shield,
    ShieldCheck,
    User as UserIcon,
} from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    changeAdminPassword,
    disableTwoFactor,
    fetchAdminProfile,
    fetchMyActivity,
    fetchNotificationPreferences,
    fetchSecurityStatus,
    startTwoFactorSetup,
    updateAdminProfile,
    updateNotificationPreferences,
    verifyTwoFactor,
} from "@/services/profile";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDateTime } from "@/lib/utils";
import type { NotificationPreferences, UserActivityItem } from "@/types/admin";
import type { User } from "@/types/user";

export default function ProfilePage() {
    const [profile, setProfile] = useState<User | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFaSecret, setTwoFaSecret] = useState<{
        secret: string;
        otpauthUrl: string;
    } | null>(null);
    const [twoFaCode, setTwoFaCode] = useState("");
    const [twoFaBusy, setTwoFaBusy] = useState(false);

    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email: true,
        push: true,
        sms: true,
    });
    const [savingPreferences, setSavingPreferences] = useState(false);

    const [activity, setActivity] = useState<UserActivityItem[]>([]);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            fetchAdminProfile(),
            fetchSecurityStatus(),
            fetchNotificationPreferences(),
            fetchMyActivity({ limit: 10 }),
        ])
            .then(([data, security, prefs, activityData]) => {
                if (cancelled) return;
                setProfile(data);
                setFirstName(data.firstName ?? "");
                setLastName(data.lastName ?? "");
                setPhone(data.phone ?? "");
                setTwoFactorEnabled(security.twoFactorEnabled);
                setPreferences(prefs);
                setActivity(activityData.items ?? []);
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

    async function handleStartTwoFactor() {
        setError(null);
        setMessage(null);
        setTwoFaBusy(true);

        try {
            const setup = await startTwoFactorSetup();
            setTwoFaSecret({ secret: setup.secret, otpauthUrl: setup.otpauthUrl });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setTwoFaBusy(false);
        }
    }

    async function handleVerifyTwoFactor() {
        if (!/^\d{6}$/.test(twoFaCode)) {
            setError("Enter the 6-digit code from your authenticator app.");
            return;
        }

        setError(null);
        setMessage(null);
        setTwoFaBusy(true);

        try {
            await verifyTwoFactor(twoFaCode);
            setTwoFactorEnabled(true);
            setTwoFaSecret(null);
            setTwoFaCode("");
            setMessage("Two-factor authentication enabled.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setTwoFaBusy(false);
        }
    }

    async function handleDisableTwoFactor() {
        const code = window.prompt("Enter your current 6-digit code to disable 2FA:");
        if (!code) return;

        setError(null);
        setMessage(null);
        setTwoFaBusy(true);

        try {
            await disableTwoFactor(code);
            setTwoFactorEnabled(false);
            setMessage("Two-factor authentication disabled.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setTwoFaBusy(false);
        }
    }

    async function handleSavePreferences() {
        setError(null);
        setMessage(null);
        setSavingPreferences(true);

        try {
            const updated = await updateNotificationPreferences(preferences);
            setPreferences(updated);
            setMessage("Notification preferences saved.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSavingPreferences(false);
        }
    }

    function togglePreference(key: keyof NotificationPreferences) {
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    async function handleSaveProfile() {
        setSavingProfile(true);
        setError(null);
        setMessage(null);

        try {
            const updated = await updateAdminProfile({
                firstName,
                lastName: lastName || undefined,
                phone: phone || undefined,
            });

            setProfile(updated);
            setMessage("Profile updated successfully.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword() {
        setError(null);
        setMessage(null);

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setSavingPassword(true);

        try {
            await changeAdminPassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage("Password changed successfully.");
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSavingPassword(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <p className="py-16 text-center text-sm text-muted-foreground">
                    Loading profile...
                </p>
            </div>
        );
    }

    const name = [firstName, lastName].filter(Boolean).join(" ");

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Profile"
                description="Manage your admin account details"
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

            {profile && (
                <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                    <div className="mb-6 flex items-center gap-4">
                        {profile.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.image}
                                alt={name}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                                {name.charAt(0) || "A"}
                            </div>
                        )}

                        <div>
                            <p className="text-xl font-bold">{name || "Admin"}</p>

                            <p className="text-sm text-muted-foreground">
                                Administrator
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                                <UserIcon className="h-3.5 w-3.5" />
                                First Name
                            </span>

                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                                <UserIcon className="h-3.5 w-3.5" />
                                Last Name
                            </span>

                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                                <Mail className="h-3.5 w-3.5" />
                                Email
                            </span>

                            <input
                                value={profile.email}
                                readOnly
                                className="h-10 w-full cursor-not-allowed rounded-lg border bg-muted px-3 text-sm"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                                <Phone className="h-3.5 w-3.5" />
                                Phone
                            </span>

                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                            />
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {savingProfile ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    Change Password
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium">
                            Current Password
                        </span>

                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium">
                            New Password
                        </span>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium">
                            Confirm New Password
                        </span>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
                        />
                    </label>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    Minimum 8 characters. You will need to log in again after changing your password.
                </p>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleChangePassword}
                        disabled={savingPassword}
                        className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                    >
                        <KeyRound className="h-4 w-4" />
                        {savingPassword ? "Updating..." : "Change Password"}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Two-Factor Authentication
                </h2>

                {twoFactorEnabled ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm text-emerald-700">
                            <ShieldCheck className="h-4 w-4" />
                            Two-factor authentication is enabled on your account.
                        </p>

                        <button
                            onClick={handleDisableTwoFactor}
                            disabled={twoFaBusy}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                            Disable 2FA
                        </button>
                    </div>
                ) : twoFaSecret ? (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-muted p-4">
                            <p className="mb-2 text-sm font-medium">
                                Scan this QR code or enter the secret manually in your
                                authenticator app:
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(twoFaSecret.otpauthUrl)}`}
                                    alt="2FA QR code"
                                    className="h-36 w-36 rounded-lg border bg-white"
                                />

                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Manual secret
                                    </p>

                                    <p className="mt-1 rounded-lg border bg-background px-3 py-2 font-mono text-sm">
                                        {twoFaSecret.secret}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <label className="block sm:max-w-56">
                                <span className="mb-1 block text-sm font-medium">
                                    Verification code
                                </span>

                                <input
                                    value={twoFaCode}
                                    onChange={(e) =>
                                        setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    placeholder="6-digit code"
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm tracking-widest outline-none transition focus:ring-2 focus:ring-primary"
                                />
                            </label>

                            <button
                                onClick={handleVerifyTwoFactor}
                                disabled={twoFaBusy}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                {twoFaBusy ? "Verifying..." : "Enable 2FA"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your admin account with
                            time-based one-time passwords.
                        </p>

                        <button
                            onClick={handleStartTwoFactor}
                            disabled={twoFaBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                        >
                            <Lock className="h-4 w-4" />
                            {twoFaBusy ? "Starting..." : "Set Up 2FA"}
                        </button>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    Notification Preferences
                </h2>

                <div className="space-y-3">
                    {(
                        [
                            { key: "email", label: "Email notifications", description: "Account and platform alerts by email." },
                            { key: "push", label: "Push notifications", description: "Real-time alerts in the dashboard." },
                            { key: "sms", label: "SMS notifications", description: "Critical alerts via text message." },
                        ] as const
                    ).map((option) => (
                        <label
                            key={option.key}
                            className="flex cursor-pointer items-center justify-between rounded-xl border p-4"
                        >
                            <div>
                                <p className="text-sm font-medium">{option.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {option.description}
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={preferences[option.key]}
                                onChange={() => togglePreference(option.key)}
                                className="h-5 w-5 accent-blue-600"
                            />
                        </label>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSavePreferences}
                        disabled={savingPreferences}
                        className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {savingPreferences ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="mb-6 text-lg font-semibold">My Recent Activity</h2>

                {activity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No recorded activity yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {activity.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {entry.action.replace(/_/g, " ").toLowerCase()}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {entry.domain}
                                        {entry.fromState || entry.toState
                                            ? ` · ${entry.fromState ?? "—"} → ${entry.toState ?? "—"}`
                                            : ""}
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
        </div>
    );
}