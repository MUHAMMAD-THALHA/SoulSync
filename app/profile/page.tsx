"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertProfile, getProfile } from "@/lib/actions-profile";
import { ProfileFormData } from "@/types";
import {
    ChevronRight,
    ChevronLeft,
    Camera,
    Calendar,
    MapPin,
    User,
    Sparkles,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, title: "Your Foundation", subtitle: "Tell Us About Yourself" },
    { id: 2, title: "Your Values & Interests", subtitle: "What Matters Most To You?" },
    { id: 3, title: "Your Vault", subtitle: "What Are You Looking For?" },
    { id: 4, title: "Share Your Story", subtitle: "Let Your True Self Shine" },
];

const VALUES = ["Honesty", "Growth", "Empathy", "Humor", "Adventure", "Creativity"];
const INTERESTS = [
    { name: "Photography", icon: Camera },
    { name: "Hiking", icon: MapPin },
    { name: "Gaming", icon: Sparkles },
    { name: "Cooking", icon: Sparkles },
];

const INTENTIONS = [
    { name: "Long-term", icon: Sparkles },
    { name: "Relationship", icon: Sparkles },
    { name: "Deep Friendship", icon: Sparkles },
    { name: "Casual Dating", icon: Sparkles },
];

export default function ProfilePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        age: 25,
        gender: "Prefer not to say",
        bio: "",
        interests: [],
        values: [],
        intentions: "Long-term",
        location: "",
    });

    useEffect(() => {
        async function loadProfile() {
            const profile = await getProfile();
            if (profile) {
                setFormData({
                    name: profile.name || "",
                    age: profile.age,
                    gender: profile.gender,
                    bio: profile.bio || "",
                    interests: profile.interests,
                    values: profile.values,
                    intentions: profile.intentions,
                    location: (profile as any).location || "",
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    const [birthday, setBirthday] = useState("");

    useEffect(() => {
        if (birthday) {
            const birthDate = new Date(birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, age }));
        }
    }, [birthday]);

    const handleNext = () => setStep((s) => Math.min(s + 1, 4));
    const handleBack = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        try {
            await upsertProfile(formData);
            router.push("/dashboard");
        } catch (error) {
            alert(error instanceof Error ? error.message : "Something went wrong");
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex flex-col items-center pt-24 pb-32 px-6 max-w-lg mx-auto overflow-x-hidden relative z-10">

            {/* Header Logo Area */}
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-5xl font-soul font-bold gold-text text-glow mb-2">SoulSync</h1>
                <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-medium">Where Emotions Are Built Through Trust</p>
            </div>

            {/* Progress Area */}
            <div className="flex flex-col items-center mb-16 w-full">
                {/* 6 Dots Indicator */}
                <div className="flex gap-3 mb-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2 w-2 rounded-full transition-all duration-300",
                                i === step ? "bg-amber-400 w-8 shadow-[0_0_15px_rgba(251,191,36,0.6)]" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-4 text-white/90 font-soul font-bold">
                    <div className="h-6 w-6 rounded-full bg-amber-400 p-1 flex items-center justify-center ring-4 ring-amber-400/20">
                        <div className="h-full w-full rounded-full bg-[#0f0c29]" />
                    </div>
                    <span className="text-lg tracking-tight">Step {step} of 4: {STEPS[step - 1].title}</span>
                </div>
            </div>

            {/* Content Title */}
            <h2 className="text-4xl font-soul font-bold text-white text-center mb-12 tracking-tight">
                {STEPS[step - 1].subtitle}
            </h2>

            {/* Form Steps */}
            <div className="w-full space-y-6">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                className="input-soul"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-xl cursor-default">+</div>
                        </div>
                        <div className="relative group">
                            <input
                                type="date"
                                className="input-soul opacity-100 cursor-pointer pr-14 text-white"
                                value={birthday}
                                onChange={e => setBirthday(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                            />
                            {!birthday && (
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-3">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] border-r border-zinc-800 pr-3">Date of Birth</span>
                                    <span className="text-zinc-400 text-sm">Select Date</span>
                                </div>
                            )}
                            <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/60 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                className="input-soul appearance-none cursor-pointer"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Non-binary</option>
                                <option>Prefer not to say</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                                <User className="h-5 w-5" />
                            </div>
                        </div>
                        <input
                            className="input-soul"
                            placeholder="Location"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                        <p className="text-[10px] text-zinc-400 text-center mt-6">This helps us find compatible connections nearby</p>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-10">
                        <div>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-6">Choose values that guides your life:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {VALUES.map(v => (
                                    <button
                                        key={v}
                                        onClick={() => {
                                            const values = formData.values.includes(v)
                                                ? formData.values.filter(x => x !== v)
                                                : [...formData.values, v];
                                            setFormData({ ...formData, values });
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border transition-all font-bold",
                                            formData.values.includes(v) ? "bg-amber-400/20 border-amber-400 text-amber-400" : "bg-white/5 border-white/5 text-zinc-300"
                                        )}
                                    >
                                        {v}
                                        {formData.values.includes(v) && <div className="h-4 w-4 rounded-sm bg-amber-400 flex items-center justify-center"><Check className="h-3 w-3 text-[#2d2a42]" strokeWidth={4} /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-6">Your Passions</p>
                            <div className="grid grid-cols-2 gap-4">
                                {INTERESTS.map(i => (
                                    <button
                                        key={i.name}
                                        onClick={() => {
                                            const interests = formData.interests.includes(i.name)
                                                ? formData.interests.filter(x => x !== i.name)
                                                : [...formData.interests, i.name];
                                            setFormData({ ...formData, interests });
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border transition-all font-bold",
                                            formData.interests.includes(i.name) ? "bg-amber-400/20 border-amber-400 text-amber-400" : "bg-white/5 border-white/5 text-zinc-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {i.name}
                                        </div>
                                        <i.icon className={cn("h-5 w-5", formData.interests.includes(i.name) ? "text-amber-400" : "text-white/40")} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10">
                        <div>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-6">Your Intentions</p>
                            <div className="grid grid-cols-2 gap-4">
                                {INTENTIONS.map(i => (
                                    <button
                                        key={i.name}
                                        onClick={() => setFormData({ ...formData, intentions: i.name })}
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border transition-all font-bold text-left",
                                            formData.intentions === i.name ? "bg-amber-400/20 border-amber-400 text-amber-400" : "bg-white/5 border-white/5 text-zinc-300"
                                        )}
                                    >
                                        {i.name}
                                        {formData.intentions === i.name ? <div className="h-4 w-4 rounded-sm bg-amber-400 flex items-center justify-center"><Check className="h-3 w-3 text-[#2d2a42]" strokeWidth={4} /></div> : <i.icon className="h-5 w-5 text-white/40" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-8 border-white/5">
                            <Sparkles className="h-8 w-8 text-amber-400/40 mb-4" />
                            <h4 className="text-white font-bold mb-2">Intentional Connection</h4>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                By sharing your intentions, you help us filter for souls who are aligned with your current life path and emotional readiness.
                            </p>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="flex flex-col items-center">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
                            <label className="relative h-48 w-48 rounded-full border-[3px] soul-border flex flex-col items-center justify-center cursor-pointer group shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-[#2d2a42] overflow-hidden">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <>
                                        <Camera className="h-12 w-12 text-soul-pink mb-2 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Upload a Profile Photo</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, avatarUrl: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        <p className="text-zinc-500 text-sm mb-12">Authentic photos build trust.</p>

                        <div className="w-full bg-white/5 rounded-3xl border border-soul-pink/30 p-8 mb-12 relative">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-4">Write your bio...</p>
                            <textarea
                                className="w-full bg-transparent text-zinc-200 font-medium placeholder:text-zinc-600 outline-none resize-none min-h-[120px]"
                                placeholder="I am a soul traveling through..."
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value.slice(0, 200) })}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">(max 200 characters)</p>
                                <p className={cn("text-[10px] font-bold", formData.bio.length >= 200 ? "text-soul-pink" : "text-zinc-500")}>
                                    {formData.bio.length}/200
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center pt-8 gap-6">
                    {step < 4 ? (
                        <button onClick={handleNext} className="btn-soul w-full text-lg py-5 flex items-center justify-center gap-3 group">
                            Continue
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="btn-soul w-full py-5 text-lg">
                            Complete Profile
                        </button>
                    )}
                    <button
                        onClick={handleBack}
                        className={cn(
                            "text-zinc-400 font-soul font-bold text-lg hover:text-white transition-all",
                            step === 1 ? "opacity-30 pointer-events-none" : "opacity-100"
                        )}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
