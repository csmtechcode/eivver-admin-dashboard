"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/use-hydrated";
import {
    bottomNavigation,
    isActive,
    navigation,
} from "@/components/sidebar/sidebar";

interface MobileDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const hydrated = useHydrated();

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCloseRef.current();
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        onCloseRef.current();
    }, [pathname]);

    return (
        <div
            className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                className={`absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            EIVVER
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Admin Dashboard
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border p-2 transition hover:bg-muted"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                    {navigation.map((item) => {
                        const active = isActive(pathname, item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                    active
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                            >
                                <Icon className="h-5 w-5" />

                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="border-t p-4">
                    {bottomNavigation.map((item) => {
                        const active = isActive(pathname, item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                    active
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                            >
                                <Icon className="h-5 w-5" />

                                {item.title}
                            </Link>
                        );
                    })}

                    <div className="mt-6 rounded-xl border p-4">
                        <p className="font-semibold">
                            {hydrated ? (user?.name ?? "Admin") : "Admin"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {hydrated
                                ? (user?.email ?? "admin@eivver.com")
                                : "admin@eivver.com"}
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}