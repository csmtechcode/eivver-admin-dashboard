import Link from "next/link";
import { User, Settings } from "lucide-react";

const links = [
    { title: "Profile", href: "/profile", icon: User },
    { title: "Settings", href: "/settings", icon: Settings },
];

export default function SidebarFooter() {
    return (
        <div className="border-t p-4">
            {links.map((item) => {
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-muted"
                    >
                        <Icon className="h-5 w-5" />

                        {item.title}
                    </Link>
                );
            })}
        </div>
    );
}