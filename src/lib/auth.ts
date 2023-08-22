import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import type { NextAuthOptions } from "next-auth";

const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [],
} satisfies NextAuthOptions;

export default authOptions;
