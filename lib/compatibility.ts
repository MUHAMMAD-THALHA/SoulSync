interface ProfileData {
    interests: string[];
    values: string[];
    intentions: string;
}

function overlapScore(a: string[], b: string[]): number {
    if (a.length === 0 && b.length === 0) return 100;
    const setA = new Set(a.map((s) => s.toLowerCase().trim()));
    const setB = new Set(b.map((s) => s.toLowerCase().trim()));
    const intersection = [...setA].filter((x) => setB.has(x));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return (intersection.length / union.size) * 100;
}

export function calculateCompatibility(
    profileA: ProfileData,
    profileB: ProfileData
): number {
    const interestScore = overlapScore(profileA.interests, profileB.interests);
    const valueScore = overlapScore(profileA.values, profileB.values);
    const intentionScore =
        profileA.intentions.toLowerCase().trim() ===
            profileB.intentions.toLowerCase().trim()
            ? 100
            : 30;

    // Weighted: values matter most, then interests, then intentions
    const weighted = interestScore * 0.35 + valueScore * 0.4 + intentionScore * 0.25;
    return Math.round(Math.min(100, Math.max(0, weighted)));
}
