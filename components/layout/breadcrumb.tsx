"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={`${item.label}-${index}`}
                            className="flex items-center gap-1.5"
                        >
                            {index > 0 && (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                            )}

                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="text-muted-foreground transition hover:text-foreground"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={
                                        isLast
                                            ? "font-medium"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}