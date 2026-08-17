import Link from "next/link";
import { FolderOpen, Package, ShieldCheck, UserCog } from "lucide-react";

const actions = [
    {
        label: "Verify Fixers",
        description: "Review pending verification applications",
        href: "/verification",
        icon: ShieldCheck,
    },
    {
        label: "Add Service",
        description: "Create a new service on the platform",
        href: "/services",
        icon: Package,
    },
    {
        label: "Create Category",
        description: "Organize services into categories",
        href: "/categories",
        icon: FolderOpen,
    },
    {
        label: "Manage Fixers",
        description: "View and manage all fixers",
        href: "/fixers",
        icon: UserCog,
    },
];

export default function QuickActions() {
    return (
        <div className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
                Quick Actions
            </h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group rounded-lg border p-4 transition hover:bg-muted"
                    >
                        <action.icon className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />

                        <p className="mt-3 font-medium">{action.label}</p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {action.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}