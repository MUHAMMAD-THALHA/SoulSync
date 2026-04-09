export interface ProfileFormData {
    name: string;
    age: number;
    gender: string;
    location: string;
    bio: string;
    interests: string[];
    values: string[];
    intentions: string;
    avatarUrl?: string;
}

export interface UserProfile {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
    bio: string;
    interests: string[];
    values: string[];
    intentions: string;
    avatarUrl: string | null;
}

export interface MatchWithProfiles {
    id: string;
    user1Id: string;
    user2Id: string;
    user1Interested: boolean;
    user2Interested: boolean;
    matched: boolean;
    otherUser: UserProfile;
    compatibility: number;
}

export interface TrustScoreInfo {
    score: number;
    profileComplete: boolean;
    verified: boolean;
    reportCount: number;
}
