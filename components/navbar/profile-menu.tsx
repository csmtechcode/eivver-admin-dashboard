"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";

export default function ProfileMenu() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);

    const logout = useAuthStore((state) => state.logout);

    const [open, setOpen] = useState(false);

    function handleLogout() {
        logout();

        router.replace("/login");
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl border px-3 py-2 transition hover:bg-muted"
            >
                <Image
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full"
                />

                <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold">
                        {user?.name ?? "Admin User"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        {user?.email ?? "admin@eivver.com"}
                    </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border bg-background py-2 shadow-lg">
                        <Link
                            href="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-muted"
                        >
                            <User className="h-4 w-4 text-muted-foreground" />

                            Profile
                        </Link>

                        <Link
                            href="/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-muted"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />

                            Settings
                        </Link>

                        <div className="my-2 border-t" />

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4" />

                            Logout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}