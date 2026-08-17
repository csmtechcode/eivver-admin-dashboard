"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/sidebar/sidebar";
import MobileDrawer from "@/components/sidebar/mobile-drawer";
import TopNavbar from "@/components/layout/top-navbar";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const token = useAuthStore((state) => state.token);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (!token) {
            router.replace("/login");
        }
    }, [token, router]);

    return (
        <div className="flex min-h-screen bg-muted/30 dark:bg-muted/5">
            <Sidebar />

            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <main className="min-w-0 flex-1 overflow-y-auto">
                <TopNavbar onMenuClick={() => setDrawerOpen(true)} />
                {children}
            </main>
        </div>
    );
}
