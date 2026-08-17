"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/services/auth";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/axios";

export default function LoginPage() {
    const router = useRouter();

    const saveLogin = useAuthStore((state) => state.login);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const response = await login({
                email,
                password,
            });

            saveLogin(response.user, response.accessToken, response.refreshToken);

            router.replace("/dashboard");
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-slate-900">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-slate-500">
                        Sign in to your EIVVER Admin account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="admin@eivver.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none transition focus:ring-2 focus:ring-slate-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none transition focus:ring-2 focus:ring-slate-400"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full rounded-lg bg-slate-900 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Forgot your password?{" "}
                    <Link
                        href="#"
                        className="font-medium text-slate-900 hover:underline"
                    >
                        Contact an Administrator
                    </Link>
                </div>
            </div>
        </main>
    );
}
