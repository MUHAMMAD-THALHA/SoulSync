"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function acceptAgreement(matchId: string, respect: boolean, honesty: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const agreement = await prisma.trustAgreement.upsert({
        where: {
            userId_matchId: { userId, matchId },
        },
        update: {
            respectAgreed: respect,
            honestyAgreed: honesty,
        },
        create: {
            userId,
            matchId,
            respectAgreed: respect,
            honestyAgreed: honesty,
        },
    });

    revalidatePath(`/matches/${matchId}`);
    return agreement;
}

export async function getMatchDetails(matchId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const userId = session.user.id;

    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            user1: { include: { profile: true, trustScore: true } },
            user2: { include: { profile: true, trustScore: true } },
            agreements: true,
        },
    });

    if (!match || !match.matched) return null;

    const otherUser = match.user1Id === userId ? match.user2 : match.user1;
    const myAgreement = match.agreements.find((a: any) => a.userId === userId);
    const otherAgreement = match.agreements.find((a: any) => a.userId !== userId);

    const bothAgreed =
        (myAgreement?.respectAgreed && myAgreement?.honestyAgreed) &&
        (otherAgreement?.respectAgreed && otherAgreement?.honestyAgreed);

    return {
        ...match,
        otherUser: {
            ...otherUser,
            profile: {
                ...otherUser.profile!,
                interests: JSON.parse(otherUser.profile!.interests) as string[],
                values: JSON.parse(otherUser.profile!.values) as string[],
            },
            trustScore: otherUser.trustScore?.score || 50,
        },
        myAgreement,
        otherAgreement,
        bothAgreed,
    };
}
