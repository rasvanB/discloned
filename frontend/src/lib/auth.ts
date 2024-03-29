import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { z } from "zod";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { env } from "@/env.mjs";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      image: string;
      name: string;
    };
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

const credentialErrors = ["invalid_credentials", "invalid_password"] as const;

type CredentialError = (typeof credentialErrors)[number];

export const errorMessageMap: Record<CredentialError, string> = {
  invalid_credentials: "Invalid credentials",
  invalid_password: "Invalid password",
};

const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = credentialsSchema.safeParse(credentials);
        if (!result.success) {
          throw new Error(errorMessageMap.invalid_credentials);
        }

        const { email, password } = result.data;

        const dbResult = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1)
          .execute();

        const userData = dbResult[0];

        if (!userData || !userData?.hashedPassword) {
          throw new Error(errorMessageMap.invalid_credentials);
        }

        const isPasswordCorrect = await bcrypt.compare(
          password,
          userData.hashedPassword,
        );

        if (!isPasswordCorrect) {
          throw new Error(errorMessageMap.invalid_password);
        }

        return {
          id: userData.id,
          email: userData.email,
          image: userData.image,
          name: userData.name,
        };
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
    signOut: "/",
  },
} satisfies NextAuthOptions;

export const getServerAuthSession = async () => {
  return await getServerSession(authOptions);
};

export default authOptions;
