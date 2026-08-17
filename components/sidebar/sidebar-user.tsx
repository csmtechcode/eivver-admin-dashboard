"use client";

import Image from "next/image";

import { useAuthStore } from "@/store/auth.store";

export default function SidebarUser() {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="flex items-center gap-3 rounded-xl border p-4">
            <Image
                src="https://i.pravatar.cc/150?img=12"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
            />

            <div className="min-w-0">
                <p className="truncate font-semibold">
                    {user?.name ?? "Admin"}
                </p>

                <p className="truncate text-sm text-muted-foreground">
                    {user?.email ?? "admin@eivver.com"}
                </p>
            </div>
        </div>
    );
}