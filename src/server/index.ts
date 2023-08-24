import { z } from "zod";
import bcrypt from "bcrypt";
import { publicProcedure, router } from "./trpc";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3).max(30),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, password } = input;
      const hashedPassword = await bcrypt.hash(password, 12);

      try {
        await db
          .insert(users)
          .values({
            name,
            email,
            hashedPassword,
          })
          .execute();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create user",
        });
      }

      const dbResult = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(users)
        .where(eq(users.email, email))
        .execute();

      const user = dbResult[0];

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return user;
    }),
});

export type AppRouter = typeof appRouter;
