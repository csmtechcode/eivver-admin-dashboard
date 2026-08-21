"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    ArrowLeftRight,
    BadgeCheck,
    Banknote,
    Bell,
    CalendarDays,
    CreditCard,
    DollarSign,
    Flag,
    LayoutDashboard,
    Megaphone,
    ScrollText,
    Settings,
    ShieldCheck,
    Star,
    Tags,
    User,
    UserCog,
    Users,
    Wallet,
    Wrench,
    type LucideIcon,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/use-hydrated";

export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

export const navigation: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Bookings", href: "/bookings", icon: CalendarDays },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Fixers", href: "/fixers", icon: UserCog },
    { title: "Reviews", href: "/reviews", icon: Star },
    { title: "Reports", href: "/reports", icon: Flag },
    { title: "Services", href: "/services", icon: Wrench },
    { title: "Categories", href: "/categories", icon: Tags },
    { title: "Payments", href: "/payments", icon: CreditCard },
    { title: "Withdrawals", href: "/withdrawals", icon: Banknote },
    { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    { title: "Wallets", href: "/wallets", icon: Wallet },
    { title: "Financial Reports", href: "/financial-reports", icon: DollarSign },
    { title: "Verification", href: "/verification", icon: BadgeCheck },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Banners", href: "/banners", icon: Megaphone },
    { title: "Admins", href: "/admins", icon: ShieldCheck },
    { title: "Audit Logs", href: "/audit-logs", icon: ScrollText },
];

export const bottomNavigation: NavItem[] = [
    { title: "Profile", href: "/profile", icon: User },
    { title: "Settings", href: "/settings", icon: Settings },
];

export function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const hydrated = useHydrated();

    return (
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-hidden border-r bg-background lg:flex lg:flex-col">
            {/* Logo */}
            <div className="shrink-0 border-b px-6 py-6">
                <h1 className="text-2xl font-bold tracking-tight">
                    EIVVER
                </h1>

                <p className="text-sm text-muted-foreground">
                    Admin Dashboard
                </p>
            </div>

            {/* Navigation */}
            <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
                {navigation.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${active
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
            <div className="shrink-0 border-t p-4">
                {bottomNavigation.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${active
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
    );
}