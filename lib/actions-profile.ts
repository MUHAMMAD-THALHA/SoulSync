"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ProfileFormData } from "@/types";

export async function upsertProfile(data: ProfileFormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    if (data.age < 18) {
        throw new Error("Age must be 18 or above");
    }

    const profile = await prisma.profile.upsert({
        where: { userId },
        update: {
            name: data.name,
            age: data.age,
            gender: data.gender,
            bio: data.bio,
            interests: JSON.stringify(data.interests),
            values: JSON.stringify(data.values),
            intentions: data.intentions,
            location: data.location,
            avatarUrl: data.avatarUrl,
        },
        create: {
            userId,
            name: data.name,
            age: data.age,
            gender: data.gender,
            bio: data.bio,
            interests: JSON.stringify(data.interests),
            values: JSON.stringify(data.values),
            intentions: data.intentions,
            location: data.location,
            avatarUrl: data.avatarUrl,
        },
    });

    // Update trust score: profile is complete
    await prisma.trustScore.update({
        where: { userId },
        data: { profileComplete: true },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/matches");

    return profile;
}

export async function getProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
    });

    if (!profile) return null;

    return {
        ...profile,
        interests: JSON.parse(profile.interests) as string[],
        values: JSON.parse(profile.values) as string[],
    };
}
