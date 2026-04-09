"use client";

import React, { useEffect, useState } from "react";
import { getMatches } from "@/lib/actions-matches";
import { getProfile } from "@/lib/actions-profile";
import { calculateCompatibility } from "@/lib/compatibility";
import { UserProfile } from "@/types";
import {
    MessageCircle,
    Sparkles,
    User,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MatchesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [m, p] = await Promise.all([getMatches(), getProfile()]);
                setMatches(m.filter((u: any) => u.matched || u.heInterested || u.iInterested));
                setMyProfile(p);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#2d2a42]">
        <Loader2 className="h-10 w-10 animate-spin text-soul-pink" />
        </div>
    );

    const mutualMatches = matches.filter(m => m.matched);

    return (
        <main className="min-h-screen pt-32 pb-40 px-6 max-w-4xl mx-auto relative z-10">
            {/* Header Area */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">Your Connections</span>
                </div>
                <h1 className="text-6xl font-soul font-extrabold text-white tracking-tighter mb-4">Matches</h1>
                <p className="text-zinc-400 text-lg font-medium opacity-80">
                    You have <span className="text-white font-bold">{mutualMatches.length}</span> souls ready to sync.
                </p>
            </div>

            {/* Matches List */}
            <div className="space-y-6">
                {matches.length === 0 ? (
                    <div className="glass rounded-[3rem] p-24 text-center border-white/5 ring-1 ring-white/10">
                        <MessageCircle className="h-16 w-16 text-soul-pink/20 mx-auto mb-6" />
                        <h1 className="text-5xl font-soul soul-text mb-4">Your Soul Matches</h1>
                        <p className="text-lavender-glow italic">"Souls who resonate with your essence."</p>
                    </div>
                ) : (
                    matches.map((user) => {
                        const score = myProfile ? calculateCompatibility(myProfile, user.profile) : 0;
                        return (
                            <div
                                key={user.id}
                                className="group relative overflow-hidden rounded-[2.5rem] p-[1px] transition-all hover:scale-[1.01]"
                            >
                                {/* Animated Hover Border */}
                                <div className="absolute inset-0 bg-gradient-to-r from-soul-pink/0 via-soul-pink/20 to-soul-pink/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative glass rounded-[2.4rem] p-6 flex items-center gap-6 bg-[#2d2a42]/90 border-white/5 ring-1 ring-white/5">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="h-20 w-20 rounded-full soul-border p-1 avatar-glow">
                                            <div className="h-full w-full rounded-full overflow-hidden bg-zinc-900 border border-[#2d2a42]">
                                                {user.profile.avatarUrl ? (
                                                    <img src={user.profile.avatarUrl} alt={user.name || "User"} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-full w-full p-4 text-zinc-700" />
                                                )}
                                            </div>
                                        </div>
                                        {user.matched && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                                                <Sparkles className="h-3 w-3 text-zinc-950" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-soul font-bold text-white mb-1 truncate">{user.name || "Anonymous"}</h3>
                                        <p className="text-[12px] text-zinc-400 font-medium mb-3">
                                            <span className="text-amber-400/80">Common Interests:</span> {user.profile.interests.slice(0, 2).join(", ")} & more
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest">Trust Agreement Active</span>
                                        </div>
                                    </div>

                                    {/* Score Circle */}
                                    <div className="hidden sm:flex h-16 w-16 rounded-full border-2 border-soul-pink/30 items-center justify-center flex-shrink-0 group-hover:border-soul-pink transition-colors">
                                        <span className="text-xl font-bold soul-text font-soul">{score}%</span>
                                    </div>

                                    {/* Action */}
                                    <Link
                                        href={`/matches/${user.id}`}
                                        className="btn-soul rounded-2xl px-8 py-3 text-sm font-bold flex items-center gap-2"
                                    >
                                        View Chat
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}
