import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    icon: ReactNode;
}

export default function StatCard({
    title,
    value,
    change,
    icon,
}: StatCardProps) {
    return (
        <div className="rounded-xl border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {title}
                </p>

                {icon}
            </div>

            <h2 className="mt-4 text-3xl font-bold">
                {value}
            </h2>

            {change && (
                <p className="mt-2 text-sm text-emerald-600">
                    {change}
                </p>
            )}
        </div>
    );
}