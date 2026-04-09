"use client";

import React from "react";
import { calculateCompatibility } from "@/lib/compatibility";
import {
    BookOpen,
    Heart,
    Mountain,
    User
} from "lucide-react";
import { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
    user: {
        id: string;
        name: string | null;
        profile: UserProfile;
        trustScore: number;
        iInterested?: boolean;
        heInterested?: boolean;
        matched?: boolean;
    };
    myProfile: UserProfile;
    onExpressInterest: (userId: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    user,
    myProfile,
    onExpressInterest,
}) => {
    const score = calculateCompatibility(myProfile, user.profile);

    return (
        <div className="relative group overflow-hidden rounded-[4rem] p-[1px] transition-all duration-700 hover:scale-[1.02] h-full min-w-[400px]">
            {/* Animated Soul Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-soul-pink via-soul-purple/40 to-soul-pink opacity-40 group-hover:opacity-100 transition-opacity" />

            <div className="relative h-full w-full bg-[#1e1a2d]/80 backdrop-blur-3xl rounded-[3.9rem] p-12 flex flex-col overflow-hidden">
                {/* Background Sparkles/Glows */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-soul-pink/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-amber-400/10 blur-[60px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-start mb-10 relative z-10">
                    {/* Progress Circle (Mockup Style) */}
                    <div className="relative h-44 w-44 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className="fill-none stroke-white/5"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className="fill-none transition-all duration-1000"
                                strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * score) / 100}
                                stroke="url(#cardRingGradient)"
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="cardRingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#fde047" />
                                    <stop offset="100%" stopColor="#ef4444" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-white">{score}%</span>
                        </div>
                    </div>

                    {/* Main Avatar */}
                    <div className="relative">
                        <div className="h-44 w-44 rounded-full overflow-hidden border-4 border-white/10 ring-8 ring-white/5 shadow-2xl">
                            {user.profile.avatarUrl ? (
                                <img src={user.profile.avatarUrl} alt={user.name || "User"} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-zinc-800 flex items-center justify-center">
                                    <User className="h-20 w-20 text-zinc-600" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Name & Age */}
                <div className="mb-10 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-4xl font-bold text-white tracking-tight leading-none">{user.name || "Anonymous"}</h3>
                        <div className="h-3 w-3 rounded-full bg-white/20" />
                    </div>
                    <p className="text-zinc-500 font-bold text-xl uppercase tracking-[0.2em]">Age: {user.profile.age}</p>
                </div>

                {/* Tags Layout as Mockup */}
                <div className="flex gap-10 flex-grow relative z-10">
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            {user.profile.interests.slice(0, 4).map((interest, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "px-8 py-3 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center min-w-[120px]",
                                        idx % 2 === 0 ? "bg-[#332e4d] text-zinc-300" : "bg-amber-100 text-amber-900"
                                    )}
                                >
                                    {interest}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button className="bg-[#332e4d] text-zinc-300 font-bold py-6 px-10 rounded-2xl flex-1 text-lg">
                                View Profile
                            </button>
                            {user.matched || user.iInterested ? (
                                <div className="bg-amber-100 text-amber-900 font-bold py-6 px-10 rounded-2xl flex-1 text-center text-lg flex items-center justify-center">
                                    {user.matched ? "Matched" : "Interest Sent"}
                                </div>
                            ) : (
                                <button
                                    onClick={() => onExpressInterest(user.id)}
                                    className="bg-amber-100 text-amber-900 font-bold py-6 px-10 rounded-2xl flex-1 text-lg hover:bg-amber-200 transition-colors"
                                >
                                    Express Interest
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Secondary decorative image placeholder as in mockup */}
                    <div className="w-56 h-72 rounded-[3.5rem] overflow-hidden border-2 border-white/5 shadow-2xl mt-auto">
                        <img
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop"
                            alt="Lifestyle"
                            className="h-full w-full object-cover grayscale-[0.2]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
