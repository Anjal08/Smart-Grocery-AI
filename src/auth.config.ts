import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      
      if (!isLoggedIn && !isAuthPage) {
        return false; // Redirect to login
      }
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
