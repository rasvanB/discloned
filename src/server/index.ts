import { z } from "zod";
import bcrypt from "bcrypt";
import { protectedProcedure, publicProcedure, router } from "./trpc";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createChannel,
  getGuildChannels,
  getUserGuildById,
  getUserGuilds,
  insertGuildToDb,
} from "@/db/queries";
import { randomUUID } from "crypto";

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
          code: "CONFLICT",
          message: "User already exists",
          cause: error,
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
        .where(eq(users.email, email));

      const user = dbResult[0];

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return user;
    }),
  createGuild: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(32),
        imageId: z.string().nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, imageId } = input;
      const { user } = ctx;

      try {
        const guildId = randomUUID();
        await insertGuildToDb({ name, imageId, ownerId: user.id, id: guildId });
        await createChannel({
          guildId,
          name: "general",
          type: "text",
        });

        return {
          id: guildId,
        };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while creating guild",
          cause: error,
        });
      }
    }),
  getGuilds: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getUserGuilds(ctx.user.id);
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong while getting guilds",
        cause: error,
      });
    }
  }),
  getGuildById: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ ctx, input }) => {
      try {
        return await getUserGuildById(ctx.user.id, input);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while getting guild",
          cause: error,
        });
      }
    }),
  getChannelsForGuild: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input }) => {
      try {
        return await getGuildChannels(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while getting channels",
          cause: error,
        });
      }
    }),
});

export type AppRouter = typeof appRouter;
