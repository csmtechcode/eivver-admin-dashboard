import type { ReactNode } from "react";

interface SidebarGroupProps {
    label: string;
    children: ReactNode;
}

export default function SidebarGroup({ label, children }: SidebarGroupProps) {
    return (
        <div className="space-y-1">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </p>

            {children}
        </div>
    );
}