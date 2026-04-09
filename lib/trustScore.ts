interface TrustScoreData {
    profileComplete: boolean;
    verified: boolean;
    reportCount: number;
}

export function calculateTrustScore(data: TrustScoreData): number {
    let score = 50; // Base score

    if (data.profileComplete) score += 20;
    if (data.verified) score += 20;
    score -= data.reportCount * 10;

    return Math.min(100, Math.max(0, score));
}

export function getTrustLevel(score: number): {
    label: string;
    color: string;
} {
    if (score >= 80) return { label: "Excellent", color: "text-emerald-400" };
    if (score >= 60) return { label: "Good", color: "text-blue-400" };
    if (score >= 40) return { label: "Fair", color: "text-amber-400" };
    return { label: "Low", color: "text-rose-400" };
}
