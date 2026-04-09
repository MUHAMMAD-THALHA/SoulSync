"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (searchParams.get("registered")) {
            setSuccess("Registration successful! Please sign in.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                throw new Error("Invalid email or password");
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f0c29] px-4 py-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 -right-24 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-1/4 -left-24 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex h-16 w-16 items-center justify-center rounded-2xl btn-soul shadow-lg shadow-soul-pink/20"
                    >
                        <svg
                            className="h-8 w-8 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2s-10 6-10 13a10 10 0 0 0 20 0c0-7-10-13-10-13z" />
                        </svg>
                    </Link>
                    <h2 className="mt-8 text-4xl font-soul font-bold tracking-tight text-white">
                        Welcome Back
                    </h2>
                    <p className="mt-4 text-zinc-400 font-medium tracking-wide">
                        Continue your journey to finding meaningful connections.
                    </p>
                </div>

                <Card variant="glass-dark" className="p-4 border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-500 dark:bg-red-900/10">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-600 dark:bg-emerald-900/10">
                                {success}
                            </div>
                        )}
                        <Input
                            label="Email address"
                            type="email"
                            id="email"
                            placeholder="alex@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                        <Button
                            type="submit"
                            variant="soul"
                            className="w-full py-6 rounded-2xl text-lg mt-4"
                            isLoading={loading}
                        >
                            Sign In
                        </Button>
                    </form>
                </Card>

                <p className="mt-8 text-center text-zinc-400 font-medium">
                    New to the sync?{" "}
                    <Link
                        href="/auth/register"
                        className="font-bold text-soul-pink hover:text-white transition-colors"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
