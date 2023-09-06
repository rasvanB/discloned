import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { z } from "zod";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { env } from "@/env.mjs";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { doesUserExist } from "@/db/queries";
import { signOut } from "next-auth/react";

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
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
          .execute();

        const user = dbResult[0];

        if (!user || !user?.hashedPassword) {
          throw new Error(errorMessageMap.invalid_credentials);
        }

        const isPasswordCorrect = await bcrypt.compare(
          password,
          user.hashedPassword,
        );

        if (!isPasswordCorrect) {
          throw new Error(errorMessageMap.invalid_password);
        }

        return {
          id: user.id,
          email: user.email,
          image: user.image,
          name: user.name,
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
  },
} satisfies NextAuthOptions;

export const getServerAuthSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return session;
  if (await doesUserExist(session.user.id)) return session;
  await signOut();
  return null;
};

export default authOptions;
