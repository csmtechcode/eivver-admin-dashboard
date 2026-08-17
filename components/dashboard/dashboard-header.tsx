"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardHeader() {
    const user = useAuthStore((state) => state.user);
    const [today, setToday] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setToday(
                new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                }).format(new Date())
            );
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const firstName = user?.name?.split(" ")[0] ?? user?.firstName ?? "Admin";

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Welcome back, {firstName}. Here&apos;s what&apos;s happening on EIVVER today.
                </p>
            </div>

            <div className="rounded-xl border bg-background px-4 py-2 text-sm">
                {today || "—"}
            </div>
        </div>
    );
}