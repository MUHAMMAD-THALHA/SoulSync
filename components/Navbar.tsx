"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: "Discover", href: "/dashboard", icon: Home },
        { name: "Messages", href: "/matches", icon: MessageCircle },
        { name: "Profile", href: "/profile", icon: User },
    ];

    // Don't show bottom nav on landing or auth pages
    const isAuthPage = pathname?.startsWith("/auth");
    const isLandingPage = pathname === "/";
    const hideNav = isAuthPage || isLandingPage;

    if (hideNav) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 lg:px-12 pointer-events-auto">
                <Link href="/" className="font-soul text-3xl font-bold tracking-tight gold-text text-glow">
                    SoulSync
                </Link>
            </nav>
        );
    }

    return (
        <>
            {/* Desktop / Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#2d2a42]/60 backdrop-blur-3xl border-b border-white/5 px-8 hidden md:flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-10 w-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform">
                        <Sparkles className="h-6 w-6 text-zinc-950" />
                    </div>
                    <span className="text-2xl font-soul font-extrabold gold-text tracking-tighter">SoulSync</span>
                </Link>

                <nav className="flex items-center gap-10">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-bold uppercase tracking-widest transition-all",
                                pathname === item.href ? "text-amber-400" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* Mobile / Bottom Navigation Bar */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm md:hidden">
                <div className="glass rounded-[2rem] p-3 shadow-2xl flex items-center justify-around border-white/15 bg-white/[0.05] backdrop-blur-2xl ring-1 ring-white/10">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-300 px-6 py-2 rounded-2xl",
                                    isActive ? "text-amber-400 bg-white/5" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                <div className="relative">
                                    {isActive && <div className="absolute inset-0 bg-amber-400/30 blur-md rounded-full" />}
                                    <item.icon className={cn("h-6 w-6 relative z-10", isActive && "fill-amber-400/10")} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};
