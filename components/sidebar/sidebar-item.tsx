"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
    title: string;
    href: string;
    icon: LucideIcon;
    nested?: boolean;
}

export default function SidebarItem({
    title,
    href,
    icon: Icon,
    nested = false,
}: SidebarItemProps) {
    const pathname = usePathname();

    const active = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                nested && "pl-10"
            )}
        >
            <Icon className="h-5 w-5" />

            {title}
        </Link>
    );
}