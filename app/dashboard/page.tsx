"use client";

import React, { useEffect, useState } from "react";
import { getMatches, expressInterest } from "@/lib/actions-matches";
import { getProfile } from "@/lib/actions-profile";
import { ProfileCard } from "@/components/ProfileCard";
import { UserProfile } from "@/types";
import { Sparkles, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Dashboard() {
    const [matches, setMatches] = useState<any[]>([]);
    const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [matchesData, profileData] = await Promise.all([
                getMatches(),
                getProfile()
            ]);
            setMatches(matchesData || []);
            setMyProfile(profileData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExpressInterest = async (userId: string) => {
        try {
            await expressInterest(userId);
            setMatches(prev => prev.map(m => m.id === userId ? { ...m, iInterested: true } : m));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to express interest");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0c29]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-soul-pink" />
                    <p className="text-zinc-500 font-soul text-sm animate-pulse uppercase tracking-widest text-glow">Searching the Stars...</p>
                </div>
            </div>
        );
    }

    if (!myProfile) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-8 p-6 text-center bg-[#0f0c29]">
                <div className="relative">
                    <Sparkles className="h-20 w-20 text-soul-pink opacity-20 blur-sm" />
                    <Sparkles className="absolute inset-0 h-20 w-20 text-soul-pink animate-pulse" />
                </div>
                <h2 className="text-4xl font-soul font-bold text-white tracking-tight">Your SoulProfile is waiting...</h2>
                <p className="text-zinc-400 max-w-sm text-lg font-medium opacity-80">Complete your profile to start discovering meaningful connections matching your energy.</p>
                <Link href="/profile" className="btn-soul px-16 py-5 rounded-2xl text-lg shadow-[0_20px_50px_rgba(255,0,128,0.3)]">
                    Complete Profile
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-40 px-6 lg:px-16 relative overflow-hidden bg-[#1e1a2d]">
            {/* Elegant Background Glows */}
            <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-soul-pink/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[1800px] mx-auto relative z-10">
                <header className="mb-16 flex flex-col gap-6">
                    <h1 className="text-7xl font-bold text-white tracking-tight">Discover Compatible Souls</h1>
                    <div className="flex items-center gap-6">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Filter"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-soul-pink/20"
                            />
                        </div>
                    </div>
                </header>

                {matches.length === 0 ? (
                    <div className="glass rounded-[4rem] p-32 text-center border-white/5 mx-auto max-w-4xl ring-1 ring-white/10 shadow-3xl">
                        <Sparkles className="h-24 w-24 text-soul-pink mx-auto mb-10 opacity-40 animate-pulse" />
                        <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">Expanding the Universe</h3>
                        <p className="text-zinc-500 text-xl font-medium">Connecting with the stars to find your perfect soul match...</p>
                    </div>
                ) : (
                    <div className="relative group/carousel">
                        {/* Horizontal Scroll Interface */}
                        <div className="flex overflow-x-auto gap-8 pb-12 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
                            {/* Duplicate matches if less than 10 for demonstration as requested */}
                            {[...matches, ...matches, ...matches].slice(0, 10).map((user, idx) => (
                                <div key={`${user.id}-${idx}`} className="snap-center h-full">
                                    <ProfileCard
                                        user={user}
                                        myProfile={myProfile}
                                        onExpressInterest={handleExpressInterest}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Carousel Indicators as Mockup */}
                        <div className="flex justify-center gap-3 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-2 w-2 rounded-full transition-all duration-300",
                                        i === 0 ? "bg-white w-8" : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
