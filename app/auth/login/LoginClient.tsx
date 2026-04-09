"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";

export default function LoginClient() {
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
        if (searchParams?.get("registered")) {
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
            <div className="w-full max-w-md relative z-10">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex h-16 w-16 items-center justify-center rounded-2xl btn-soul shadow-lg shadow-soul-pink/20">
                        ❤️
                    </Link>

                    <h2 className="mt-8 text-4xl font-bold text-white">
                        Welcome Back
                    </h2>
                </div>

                <Card variant="glass-dark" className="p-4 border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4">

                        {error && <div className="text-red-500">{error}</div>}
                        {success && <div className="text-green-500">{success}</div>}

                        <Input
                            label="Email address"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />

                        <Button type="submit" isLoading={loading}>
                            Sign In
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}