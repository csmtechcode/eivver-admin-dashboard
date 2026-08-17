"use client";

import { useEffect, useState } from "react";
import { KeyRound, Mail, Phone, Save, Shield, User as UserIcon } from "lucide-react";

import PageHeader from "@/components/layout/page-header";
import {
    changeAdminPassword,
    fetchAdminProfile,
    updateAdminProfile,
} from "@/services/profile";
import { getApiErrorMessage } from "@/lib/axios";
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

    useEffect(() => {
        let cancelled = false;

        
        fetchAdminProfile()
            .then((data) => {
                if (cancelled) return;
                setProfile(data);
                setFirstName(data.firstName ?? "");
                setLastName(data.lastName ?? "");
                setPhone(data.phone ?? "");
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
        </div>
    );
}