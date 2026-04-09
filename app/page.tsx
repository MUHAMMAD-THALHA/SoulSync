import Link from "next/link";
import { Sparkles, Heart, Shield, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f0c29]">
      {/* Ethereal Background Element Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29]/20 via-transparent to-[#0f0c29]" />
      </div>

      {/* Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-[700px] h-[700px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-24 text-center lg:pt-48">
        <div className="mb-10 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-soul-pink/30" />
            <Heart className="h-6 w-6 text-soul-pink animate-pulse" />
            <div className="h-[1px] w-12 bg-soul-pink/30" />
          </div>
          <h1 className="text-7xl md:text-9xl font-soul font-extrabold soul-text text-glow tracking-tighter leading-none mb-8">
            SoulSync
          </h1>
          <p className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.5em] text-zinc-400 opacity-90 decoration-soul-pink/20 underline-offset-8 underline">
            Where Emotions Are Built Through Trust
          </p>
        </div>

        <h2 className="mx-auto mt-16 max-w-4xl text-5xl font-soul font-bold text-white tracking-tight sm:text-7xl lg:text-8xl leading-[1.05]">
          A New Era of <br />
          <span className="text-white/50">Meaningful Connection</span>
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-xl text-zinc-400 font-medium opacity-80 leading-relaxed">
          SoulSync moves beyond swipes and surfaces. We match souls based on core values, shared intentions, and emotional resonance.
        </p>

        <div className="mt-20 flex flex-col items-center justify-center gap-10 sm:flex-row">
          <Link href="/auth/register" className="btn-soul px-20 py-7 text-2xl rounded-full shadow-[0_25px_70px_rgba(255,0,128,0.3)] hover:scale-105 transition-transform">
            Get Started
          </Link>
          <Link href="/auth/login" className="text-xl font-soul font-bold text-white hover:text-soul-pink transition-colors uppercase tracking-widest border-b-2 border-white/10 pb-2">
            Sign In
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-40 grid grid-cols-1 gap-16 sm:grid-cols-3 border-t border-white/5 pt-20">
          <div className="flex flex-col items-center group">
            <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-soul-pink mb-6 group-hover:bg-soul-pink/10 transition-colors">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-white font-soul font-bold text-2xl mb-3">Trust-First</h3>
            <p className="text-zinc-500 text-base max-w-[250px]">Every soul is verified through our unique trust-score system.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-soul-pink mb-6 group-hover:bg-soul-pink/10 transition-colors">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-white font-soul font-bold text-2xl mb-3">Emotional Matching</h3>
            <p className="text-zinc-500 text-base max-w-[250px]">Our algorithms prioritize deep values over aesthetic filters.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-soul-pink mb-6 group-hover:bg-soul-pink/10 transition-colors">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-white font-soul font-bold text-2xl mb-3">Mutual Consent</h3>
            <p className="text-zinc-500 text-base max-w-[250px]">Communications only begin after mutual interest is expressed.</p>
          </div>
        </div>
      </div>

      {/* Particle Effects Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="particle h-3 w-3 top-1/4 left-1/4 animate-[float_12s_infinite]" />
        <div className="particle h-2 w-2 top-2/3 left-1/2 animate-[float_15s_infinite]" />
        <div className="particle h-4 w-4 top-1/2 left-[85%] animate-[float_10s_infinite]" />
      </div>
    </main>
  );
}
