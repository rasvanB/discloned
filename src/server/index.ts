import { z } from "zod";
import bcrypt from "bcrypt";
import { protectedProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import {
  createChannel,
  createServerMember,
  createUser,
  getGuildChannels,
  getUserByEmail,
  getUserGuildById,
  getUserGuilds,
  insertGuildToDb,
} from "@/db/queries";
import { randomUUID } from "crypto";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3).max(30),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, email, password } = input;
      const hashedPassword = await bcrypt.hash(password, 12);

      try {
        await createUser({
          email,
          name,
          hashedPassword,
        });
      } catch (error) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
          cause: error,
        });
      }

      const user = getUserByEmail(email);

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
      }),
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

        await createServerMember({
          guildId,
          role: "owner",
          userId: user.id,
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
    .query(async ({ input, ctx }) => {
      try {
        return await getGuildChannels(input, ctx.user.id);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while getting channels",
          cause: error,
        });
      }
    }),
});
