"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMatchDetails, acceptAgreement } from "@/lib/actions-trust";
import {
    Sparkles,
    User,
    ShieldCheck,
    MessageCircle,
    ChevronLeft,
    Loader2,
    Heart,
    Lock,
    Unlock,
    Mail,
    IdCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MatchDetailPage() {
    const { matchId } = useParams() as { matchId: string };
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [respect, setRespect] = useState(false);
    const [honesty, setHonesty] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const details = await getMatchDetails(matchId);
                if (!details) router.push("/matches");
                setData(details);
                if (details?.myAgreement) {
                    setRespect(details.myAgreement.respectAgreed);
                    setHonesty(details.myAgreement.honestyAgreed);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [matchId]);

    const handleAgree = async () => {
        setSubmitting(true);
        try {
            await acceptAgreement(matchId, respect, honesty);
            const details = await getMatchDetails(matchId);
            setData(details);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#0f0c29]">
            <Loader2 className="h-10 w-10 animate-spin text-soul-pink" />
        </div>
    );
    if (!data) return null;

    const { otherUser, bothAgreed } = data;

    return (
        <main className="min-h-screen pt-32 pb-40 px-6 max-w-5xl mx-auto relative z-10">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 -right-24 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-1/4 -left-24 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            {/* Back Nav */}
            <Link
                href="/matches"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group"
            >
                <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Back to Matches</span>
            </Link>

            {/* Header / Interaction Status */}
            <div className="flex flex-col md:flex-row items-center gap-10 mb-20 bg-white/5 rounded-[3rem] p-10 border border-white/5 ring-1 ring-white/10 relative overflow-hidden backdrop-blur-xl">
                {/* Connection Line */}
                <div className="absolute inset-0 -z-10 opacity-10">
                    <svg width="100%" height="100%" className="absolute inset-0">
                        <path d="M0 50 Q250 0 500 50 T1000 50" stroke="#ff0080" strokeWidth="2" fill="none" className="animate-pulse" />
                    </svg>
                </div>

                <div className="relative">
                    <div className="h-32 w-32 rounded-full soul-border p-1 avatar-glow">
                        <div className="h-full w-full rounded-full overflow-hidden bg-zinc-900 border border-[#0f0c29]">
                            {otherUser.profile.avatarUrl ? (
                                <img src={otherUser.profile.avatarUrl} alt={otherUser.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-full w-full p-8 text-zinc-700" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-5xl font-soul font-bold text-white tracking-tighter">{otherUser.name}</h1>
                        {bothAgreed && <ShieldCheck className="h-8 w-8 text-green-500" />}
                    </div>
                    <p className="text-zinc-400 font-medium mb-6">
                        {bothAgreed ? "SoulSync ID Verified & Connected" : "Connection Request Pending"}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Sync Score: {data.compatibility || 88}%</span>
                        </div>
                    </div>
                </div>

                {bothAgreed && (
                    <button className="btn-gold rounded-full px-10 py-5 text-sm font-bold flex items-center gap-3">
                        <MessageCircle className="h-5 w-5" />
                        Start Conversation
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Left Side: Trust & About */}
                <div className="lg:col-span-7 space-y-12">
                    {/* Trust Agreement Section */}
                    <div className="glass rounded-[3rem] p-10 border border-soul-pink/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="h-24 w-24 text-soul-pink" />
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <Lock className="h-5 w-5 text-soul-pink" />
                            <h2 className="text-2xl font-soul font-bold text-white">The Heartbeat of Trust</h2>
                        </div>

                        <p className="text-zinc-400 text-sm leading-relaxed mb-10 italic">
                            "True connection is built on a foundation of safety and honesty. Before we reveal the bridge to conversation, we ask for your commitment to our shared soul."
                        </p>

                        <div className="space-y-6 mb-12">
                            {[
                                {
                                    id: "respect",
                                    title: "Respect Agreement",
                                    desc: "I commit to communicating with kindness, responsibility, and total emotional respect.",
                                    checked: respect,
                                    setter: setRespect
                                },
                                {
                                    id: "honesty",
                                    title: "Transparent Intentions",
                                    desc: "I agree to be honest about my journey and my intentions on SoulSync.",
                                    checked: honesty,
                                    setter: setHonesty
                                }
                            ].map(item => (
                                <label
                                    key={item.id}
                                    className={cn(
                                        "flex gap-5 p-6 rounded-3xl border transition-all cursor-pointer group/label",
                                        item.checked ? "bg-soul-pink/10 border-soul-pink/40" : "bg-white/5 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="relative pt-1">
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={(e) => item.setter(e.target.checked)}
                                            className="peer hidden"
                                        />
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            item.checked ? "bg-soul-pink border-soul-pink" : "border-white/20 peer-hover:border-white/40"
                                        )}>
                                            {item.checked && <Sparkles className="h-3 w-3 text-white" strokeWidth={4} />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={cn("font-bold mb-1", item.checked ? "text-soul-pink" : "text-zinc-200")}>{item.title}</h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium uppercase tracking-tight">{item.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <button
                            disabled={!respect || !honesty || submitting}
                            onClick={handleAgree}
                            className={cn(
                                "w-full py-5 rounded-[2rem] text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3",
                                respect && honesty && !submitting
                                    ? "btn-soul shadow-[0_10px_30px_rgba(255,0,128,0.3)] hover:scale-[1.02]"
                                    : "bg-white/10 text-white/20 cursor-not-allowed border border-white/5"
                            )}
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {data.myAgreement?.respectAgreed ? "Seal Updated Agreement" : "Seal The Trust Agreement"}
                                    <Heart className="h-4 w-4" />
                                </>
                            )}
                        </button>

                        {data.myAgreement?.respectAgreed && !bothAgreed && (
                            <div className="mt-8 flex items-center justify-center gap-3 py-4 px-6 border border-soul-pink/20 rounded-2xl bg-soul-pink/5">
                                <div className="h-2 w-2 rounded-full bg-soul-pink animate-ping" />
                                <p className="text-[10px] text-soul-pink font-bold uppercase tracking-widest">
                                    Waiting for {otherUser.name.split(' ')[0]} to commit...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Discovery Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4 text-soul-pink" />
                            <h3 className="text-lg font-soul font-bold text-white uppercase tracking-widest">Their Story</h3>
                        </div>
                        <div className="glass rounded-[2rem] p-8 border border-white/5 relative bg-white/2 overflow-hidden italic">
                            <span className="absolute top-4 left-6 text-6xl text-white/5 font-serif">"</span>
                            <p className="text-zinc-300 leading-relaxed relative z-10 px-4">
                                {otherUser.profile.bio}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Reveal Section */}
                <div className="lg:col-span-5">
                    <div className="sticky top-32 space-y-8">
                        <div className="glass rounded-[3rem] p-10 border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-soul-pink/5 to-transparent -z-10" />

                            <div className="flex flex-col items-center text-center">
                                <div className={cn(
                                    "h-24 w-24 rounded-full flex items-center justify-center mb-6 transition-all duration-700",
                                    bothAgreed ? "bg-green-500/10 text-green-500 rotate-[360deg] scale-110" : "bg-soul-pink/10 text-soul-pink"
                                )}>
                                    {bothAgreed ? <Unlock className="h-10 w-10 shadow-glow" /> : <Lock className="h-10 w-10" />}
                                </div>
                                <h3 className="text-2xl font-soul font-bold text-white mb-3">
                                    {bothAgreed ? "Bridge Revealed" : "Bridge Locked"}
                                </h3>
                                <p className="text-zinc-500 text-sm mb-10 leading-relaxed">
                                    {bothAgreed
                                        ? "The trust agreement is complete. You may now step across the bridge and reach out."
                                        : "Seal the trust agreement to reveal the bridge and connect deeper with " + otherUser.name.split(' ')[0] + "."}
                                </p>

                                {bothAgreed ? (
                                    <div className="w-full space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                                        <div className="bg-[#0f0c29] rounded-3xl p-6 border border-soul-pink/30 text-left cursor-default hover:border-soul-pink transition-all group/info">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-soul-pink/10 flex items-center justify-center">
                                                    <Mail className="h-5 w-5 text-soul-pink" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Email Address</p>
                                                    <p className="text-zinc-200 font-bold text-lg">{otherUser.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0f0c29] rounded-3xl p-6 border border-soul-pink/30 text-left cursor-default hover:border-soul-pink transition-all group/info">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-soul-pink/10 flex items-center justify-center">
                                                    <IdCard className="h-5 w-5 text-soul-pink" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">SoulSync ID</p>
                                                    <p className="text-zinc-200 font-bold text-lg">@{otherUser.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-4 opacity-30 grayscale">
                                        <div className="h-20 bg-white/5 rounded-3xl border border-dashed border-white/10" />
                                        <div className="h-20 bg-white/5 rounded-3xl border border-dashed border-white/10" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Safety Warning */}
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-3 mb-3 text-rose-500">
                                <ShieldCheck className="h-5 w-5" />
                                <h4 className="font-bold text-sm tracking-widest uppercase italic">Sanctuary Safety</h4>
                            </div>
                            <p className="text-rose-500/70 text-[11px] leading-relaxed font-medium">
                                Keep the conversation respectful. Trust happens in the soul, but verification happens in the world. Always meet in public places.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

