import { z } from "zod";
import bcrypt from "bcrypt";
import {
  protectedProcedure,
  publicProcedure,
  router,
  useSessionToken,
} from "./trpc";
import { TRPCError } from "@trpc/server";
import {
  addMemberToGuild,
  createChannel,
  createGuildMember,
  createServerInvite,
  createUser,
  deleteChannel,
  deleteGuild,
  deleteGuildMember,
  getChannelById,
  getChannelMessages,
  getGuildChannels,
  getGuildMemberByUserId,
  getGuildMembers,
  getInvite,
  getMember,
  getServerInvite,
  getUserByEmail,
  getUserGuildById,
  getUserGuilds,
  insertGuildToDb,
  updateMember,
} from "@/db/queries";
import { randomUUID } from "crypto";
import axios from "axios";
import { env } from "@/env.mjs";

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

        await createGuildMember({
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
  createChannel: protectedProcedure
    .input(
      z.object({
        guildId: z.string().nonempty(),
        name: z.string().min(3).max(32),
        type: z.enum(["text", "voice", "video"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await createChannel(input);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while creating channel",
          cause: error,
        });
      }
    }),
  getMembersForGuild: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input }) => {
      try {
        return await getGuildMembers(input);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while getting members",
          cause: error,
        });
      }
    }),
  getMemberById: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input }) => {
      try {
        return await getMember(input);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong getting member info",
          cause: error,
        });
      }
    }),
  getCurrentServerMember: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input, ctx }) => {
      try {
        return (await getGuildMemberByUserId(input, ctx.user.id)) || null;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong getting member info",
          cause: error,
        });
      }
    }),
  deleteServer: protectedProcedure
    .input(z.string().nonempty())
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const member = await getGuildMemberByUserId(input, user.id);

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not a member of this guild",
        });
      }

      if (member.role !== "owner") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to delete this guild",
        });
      }

      try {
        await deleteGuild(input);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while deleting guild",
          cause: error,
        });
      }
    }),
  leaveServer: protectedProcedure
    .input(z.string().nonempty())
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const member = await getGuildMemberByUserId(input, user.id);

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not a member of this guild",
        });
      }

      try {
        await deleteGuildMember(member.id);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while deleting guild",
          cause: error,
        });
      }
    }),
  getInvite: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input }) => {
      if (input === "none") return null;
      try {
        return (await getServerInvite(input)) || null;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while getting invite",
          cause: error,
        });
      }
    }),
  createInvite: protectedProcedure
    .input(z.string().nonempty())
    .mutation(async ({ input }) => {
      try {
        return (await createServerInvite(input)) || null;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while creating invite",
          cause: error,
        });
      }
    }),
  changeMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string().nonempty(),
        role: z.enum(["owner", "admin", "member"]),
        guildId: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const member = await getGuildMemberByUserId(input.guildId, user.id);

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not a member of this guild",
        });
      }

      if (input.role === "owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change to owner role",
        });
      }

      if (member.role !== "owner") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to change role",
        });
      }

      try {
        await updateMember(input.memberId, {
          role: input.role,
        });
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong changing member role",
          cause: error,
        });
      }
    }),
  kickMember: protectedProcedure
    .input(
      z.object({
        memberId: z.string().nonempty(),
        guildId: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const currentMember = await getGuildMemberByUserId(
        input.guildId,
        user.id,
      );

      if (!currentMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not a member of this guild",
        });
      }

      if (currentMember.role !== "owner" && currentMember.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to kick member",
        });
      }

      try {
        await deleteGuildMember(input.memberId);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went kicking member",
          cause: error,
        });
      }
    }),

  getInviteInfo: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input }) => {
      try {
        return await getInvite(input);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while getting invite info",
          cause: error,
        });
      }
    }),
  addServerMember: protectedProcedure
    .input(z.string().nonempty())
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      try {
        await addMemberToGuild(input, user.id);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong adding member to guild",
          cause: error,
        });
      }
    }),
  getChannelMessages: protectedProcedure
    .input(
      z.object({
        channelId: z.string().nonempty(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await getChannelMessages(input.channelId, input.limit);
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong getting channel messages",
          cause: error,
        });
      }
    }),
  getChannelInfo: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ input }) => {
      try {
        return await getChannelById(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong getting channel info",
          cause: error,
        });
      }
    }),
  sendMessage: protectedProcedure
    .use(useSessionToken)
    .input(
      z.object({
        channelId: z.string().nonempty(),
        content: z.string().nonempty().max(2000),
        memberId: z.string().nonempty(),
        fileUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await axios.post(`${env.NEXT_PUBLIC_BACKEND_URL}/messages`, input, {
          headers: {
            Authorization: `Bearer ${ctx.sessionToken}`,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went sending message",
          cause: error,
        });
      }
    }),
  updateMessage: protectedProcedure
    .use(useSessionToken)
    .input(
      z.object({
        messageId: z.string().nonempty(),
        memberId: z.string().nonempty(),
        content: z.string().nonempty().max(2000),
        channelId: z.string().nonempty(),
        fileUrl: z.string().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await axios.patch(
          `${env.NEXT_PUBLIC_BACKEND_URL}/messages/${input.messageId}`,
          input,
          {
            headers: {
              Authorization: `Bearer ${ctx.sessionToken}`,
            },
          },
        );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went sending message",
          cause: error,
        });
      }
    }),
  deleteChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string().nonempty(),
        guildId: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const member = await getGuildMemberByUserId(input.guildId, user.id);

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not a member of this guild",
        });
      }

      if (member.role !== "owner" && member.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to delete channel",
        });
      }

      try {
        await deleteChannel(input.channelId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went sending message",
          cause: error,
        });
      }
    }),
  deleteMessage: protectedProcedure
    .use(useSessionToken)
    .input(
      z.object({
        messageId: z.string().nonempty(),
        memberId: z.string().nonempty(),
        channelId: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await axios.delete(
          `${env.NEXT_PUBLIC_BACKEND_URL}/messages/${input.messageId}`,
          {
            headers: {
              Authorization: `Bearer ${ctx.sessionToken}`,
            },
            data: {
              memberId: input.memberId,
              channelId: input.channelId,
            },
          },
        );
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went sending message",
          cause: error,
        });
      }
    }),
  infiniteMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        channelId: z.string().nonempty(),
      }),
    )
    .query(async (opts) => {
      const { input } = opts;
      const limit = input.limit ?? 20;
      const { cursor, channelId } = input;

      const items = await getChannelMessages(channelId, limit, cursor ?? 0);

      let nextCursor: typeof cursor | undefined = undefined;

      if (items.length > limit) {
        items.pop();
        nextCursor = cursor ? cursor + limit : limit;
      }

      return { items, nextCursor };
    }),
});
