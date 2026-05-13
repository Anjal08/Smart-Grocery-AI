import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              oauthProvider: "google",
              oauthId: account.providerAccountId,
              healthPreferences: [],
              dietaryProfile: {
                allergies: [],
                calorieGoal: 2000,
                preferOrganic: false,
              },
            });
          } else {
            existingUser.image = user.image;
            existingUser.name = user.name;
            await existingUser.save();
          }
        } catch (error) {
          console.error("Error during sign in callback:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session }) {
      if (session?.user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).healthPreferences = dbUser.healthPreferences || [];
            (session.user as any).dietaryProfile = dbUser.dietaryProfile || {};
          }
        } catch (error) {
          console.error("Error enriching session:", error);
        }
      }
      return session;
    },
  },
});
