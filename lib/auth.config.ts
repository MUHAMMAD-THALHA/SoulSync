import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// This config is Edge-compatible (no database adapter)
export const authConfig = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize() {
                // This is only a stub for the Edge runtime/middleware
                // The actual authorization happens in lib/auth.ts
                return null;
            },
        }),
    ],
    callbacks: {},
} satisfies NextAuthConfig;
