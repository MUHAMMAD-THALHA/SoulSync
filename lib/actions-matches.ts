"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function expressInterest(otherUserId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // Normalize user IDs to ensure unique match record (smaller ID first)
    const isUser1 = userId < otherUserId;
    const user1Id = isUser1 ? userId : otherUserId;
    const user2Id = isUser1 ? otherUserId : userId;

    const match = await prisma.match.upsert({
        where: {
            user1Id_user2Id: { user1Id, user2Id },
        },
        update: isUser1 ? { user1Interested: true } : { user2Interested: true },
        create: {
            user1Id,
            user2Id,
            user1Interested: isUser1,
            user2Interested: !isUser1,
        },
    });

    // Check for mutual interest
    if (match.user1Interested && match.user2Interested && !match.matched) {
        await prisma.match.update({
            where: { id: match.id },
            data: { matched: true },
        });
    }

    revalidatePath("/matches");
    return match;
}

export async function getMatches() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;
    const userProfile = await prisma.profile.findUnique({
        where: { userId },
    });

    if (!userProfile) return [];

    const users = await prisma.user.findMany({
        where: {
            id: { not: userId },
            profile: { isNot: null },
        },
        include: {
            profile: true,
            trustScore: true,
            matchesAsUser1: { where: { user2Id: userId } },
            matchesAsUser2: { where: { user1Id: userId } },
        },
    });

    return users.map((u) => {
        const profile = u.profile!;
        const trust = u.trustScore?.score || 50;

        // Check existing match/interest status
        const match1 = u.matchesAsUser2[0]; // I am user1, he is user2
        const match2 = u.matchesAsUser1[0]; // He is user1, I am user2

        // Determine my interest and his interest
        let iInterested = false;
        let heInterested = false;
        let matched = false;

        const existingMatch = match1 || match2;
        if (existingMatch) {
            matched = existingMatch.matched;
            if (existingMatch.user1Id === userId) {
                iInterested = existingMatch.user1Interested;
                heInterested = existingMatch.user2Interested;
            } else {
                iInterested = existingMatch.user2Interested;
                heInterested = existingMatch.user1Interested;
            }
        }

        return {
            id: u.id,
            name: u.name,
            profile: {
                ...profile,
                interests: JSON.parse(profile.interests) as string[],
                values: JSON.parse(profile.values) as string[],
            },
            trustScore: trust,
            iInterested,
            heInterested,
            matched,
        };
    });
}
