import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { syncUserWithCognito, getUserBySub } from "./services/userService";
import { NextResponse } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Cognito({
      clientId: process.env.AUTH_COGNITO_ID!,
      clientSecret: process.env.AUTH_COGNITO_SECRET!,
      issuer: process.env.AUTH_COGNITO_ISSUER!,
      checks:
        process.env.NODE_ENV === "production" ? ["pkce", "state"] : [],
      profile(profile) {
        return { ...profile };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile?.sub) return false;

      try {
        await syncUserWithCognito(profile.sub, user.email!);
        return true;
      } catch (error) {
        console.error("Failed to sync user:", error);
        return false;
      }
    },
    jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.sub = user.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.sub || !session.user) return session;

      const dbUser = await getUserBySub(token.sub);

      if (dbUser == null) return session;

      session.user.id = dbUser.id;

      return session;
    },
    async authorized({ auth, request }) {
      const loginPage = new URL("/", request.url);
      const tasksPage = new URL("/tasks", request.url);
      const protectedRoutes = ["/tasks"];

      const isProtectedRoute = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route),
      );

      if (auth === null && isProtectedRoute) {
        return NextResponse.redirect(loginPage);
      }

      if (!!auth && !isProtectedRoute) {
        return NextResponse.redirect(tasksPage);
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
});
