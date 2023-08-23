import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { env } from "@/env.mjs";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

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
          throw new Error("Invalid credentials");
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
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return {
          email: user.email,
          image: user.image,
          name: user.name,
          id: user.id,
        };
      },
    }),
  ],
  secret: env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthOptions;

export default authOptions;
