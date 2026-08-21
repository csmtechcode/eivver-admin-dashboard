"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    CalendarDays,
    LogOut,
    Menu,
    Moon,
    Search,
    Sun,
    User,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/components/theme/theme-provider";
import NotificationsBell from "@/components/notifications/notifications-bell";

const TITLES: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/customers": "Customers",
    "/fixers": "Fixers",
    "/bookings": "Bookings",
    "/services": "Services",
    "/categories": "Categories",
    "/payments": "Payments",
    "/verification": "Verification",
    "/notifications": "Notifications",
    "/settings": "Settings",
    "/profile": "Profile",
};

export default function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const logout = useAuthStore((state) => state.logout);
    const { resolvedTheme, toggleTheme } = useTheme();

    const [today, setToday] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setToday(
                new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                }).format(new Date())
            );
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const title = TITLES[pathname] ?? "Dashboard";

    function handleLogout() {
        logout();
        router.replace("/login");
    }

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background px-4 sm:px-6">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg border p-2 transition hover:bg-muted lg:hidden"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                        {title}
                    </h1>

                    <div className="mt-1 hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                        <CalendarDays className="h-4 w-4" />
                        <span>{today || "—"}</span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={toggleTheme}
                    className="rounded-lg border p-2 transition hover:bg-muted"
                    aria-label={`Switch to ${mounted && resolvedTheme === "dark" ? "light" : "dark"} mode`}
                >
                    {mounted && resolvedTheme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </button>

                <NotificationsBell />

                <Link
                    href="/bookings"
                    className="hidden rounded-lg border p-2 transition hover:bg-muted sm:block"
                    aria-label="Search bookings"
                >
                    <Search className="h-5 w-5" />
                </Link>

                <Link
                    href="/profile"
                    className="flex items-center rounded-lg border p-2 transition hover:bg-muted"
                    aria-label="View profile"
                >
                    <User className="h-5 w-5" />
                </Link>

                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    aria-label="Log out"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
}