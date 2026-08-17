"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

const notifications = [
    {
        id: "N-001",
        title: "New booking received",
        description: "John Doe booked Plumbing for Aug 15.",
        time: "2 mins ago",
        unread: true,
    },
    {
        id: "N-002",
        title: "Fixer verification",
        description: "Fatima Sani submitted new documents.",
        time: "1 hour ago",
        unread: true,
    },
    {
        id: "N-003",
        title: "Payment successful",
        description: "₦12,000 payment from John Doe confirmed.",
        time: "3 hours ago",
        unread: false,
    },
];

export default function NotificationButton() {
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative rounded-lg border p-2 transition hover:bg-muted"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-background p-4 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold">Notifications</h3>

                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {unreadCount} new
                            </span>
                        </div>

                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`rounded-xl border p-3 ${notification.unread
                                        ? "bg-muted/50"
                                        : "opacity-70"
                                        }`}
                                >
                                    <p className="text-sm font-semibold">
                                        {notification.title}
                                    </p>

                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {notification.description}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {notification.time}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}