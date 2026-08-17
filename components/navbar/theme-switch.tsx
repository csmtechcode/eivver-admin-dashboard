"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { STORAGE_KEYS } from "@/lib/constants";

function getInitialTheme(): boolean {
    if (typeof window === "undefined") return false;

    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);

    if (stored) return stored === "dark";

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeSwitch() {
    const [dark, setDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);

        window.localStorage.setItem(
            STORAGE_KEYS.theme,
            dark ? "dark" : "light"
        );
    }, [dark]);

    return (
        <button
            onClick={() => setDark((prev) => !prev)}
            className="rounded-lg border p-2 transition hover:bg-muted"
            aria-label="Toggle theme"
        >
            {dark ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
}