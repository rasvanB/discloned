import { and, desc, eq, sql, not } from "drizzle-orm";
import { db } from ".";
import {
  channel,
  conversation,
  guild,
  invite,
  member,
  message,
  uploadedImage,
  user,
} from "./schema";

export const generateChannelId = () =>
  Math.floor(Math.random() * Math.pow(10, 14)).toString();

type ImageInsert = typeof uploadedImage.$inferInsert;

export async function insertImageToDb(input: ImageInsert) {
  try {
    await db.insert(uploadedImage).values(input).execute();
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

type GuildInsert = typeof guild.$inferInsert;
type ChannelInsert = typeof channel.$inferInsert;
type UserInsert = typeof user.$inferInsert;
type ConversationInsert = typeof conversation.$inferInsert;
type MemberInsert = typeof member.$inferInsert;

export type MessageSelect = typeof message.$inferSelect;

export async function insertGuildToDb(input: GuildInsert) {
  try {
    const executedQuery = await db.insert(guild).values(input);
    console.log("INSERT ID: ", executedQuery.insertId);
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

export async function getUserGuilds(userId: string) {
  try {
    return await db
      .select({
        id: guild.id,
        name: guild.name,
        image: {
          id: uploadedImage.id,
          url: uploadedImage.url,
        },
      })
      .from(guild)
      .innerJoin(member, eq(guild.id, member.guildId))
      .innerJoin(uploadedImage, eq(guild.image, uploadedImage.id))
      .where(eq(member.userId, userId));
  } catch (error) {
    throw new Error("Something went wrong while getting user guilds");
  }
}

export async function getUserGuildById(userId: string, guildId: string) {
  try {
    return await db.query.guild.findFirst({
      where(fields, { eq, and }) {
        return and(eq(fields.id, guildId));
      },
      with: {
        channels: true,
        members: {
          where(fields, { eq }) {
            return eq(fields.userId, userId);
          },
          with: {
            user: {
              columns: {
                id: false,
                email: false,
                hashedPassword: false,
                emailVerified: false,
              },
            },
          },
          columns: {
            guildId: false,
          },
        },
      },
      columns: {
        image: false,
        ownerId: false,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while getting guild by id");
  }
}

export async function createChannel(input: ChannelInsert) {
  try {
    const channelId = generateChannelId();
    await db
      .insert(channel)
      .values({ ...input, id: channelId })
      .execute();
    return channelId;
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

export async function getGuildChannels(guildId: string, userId: string) {
  try {
    return await db
      .select({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        guildId: channel.guildId,
        createdAt: channel.createdAt,
      })
      .from(channel)
      .leftJoin(member, eq(channel.guildId, member.guildId))
      .where(and(eq(member.userId, userId), eq(channel.guildId, guildId)))
      .orderBy(desc(channel.createdAt));
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while getting guild channels");
  }
}

export async function getChannelById(channelId: string) {
  try {
    return await db.query.channel.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, channelId);
      },
    });
  } catch (error) {
    throw new Error("Something went wrong while getting channel by id");
  }
}

export async function createUser(input: UserInsert) {
  try {
    await db.insert(user).values(input);
  } catch (error) {
    throw new Error("Something went wrong while creating user");
  }
}

export async function getUserByEmail(email: string) {
  try {
    const dbResult = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    const userData = dbResult[0];

    if (!userData) {
      console.log("no users found");
      return;
    }

    return userData;
  } catch (error) {
    throw new Error("Something went wrong while getting user by email");
  }
}

export async function createGuildMember(input: MemberInsert) {
  try {
    await db.insert(member).values(input);
  } catch (error) {
    throw new Error("Something went wrong while creating member");
  }
}

export async function getGuildMembers(guildId: string) {
  try {
    return await db
      .select({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: {
          name: user.name,
          image: user.image,
          email: user.email,
        },
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.guildId, guildId));
  } catch (error) {
    throw new Error("Something went wrong while getting guild members");
  }
}

export async function getGuildMemberByUserId(guildId: string, userId: string) {
  try {
    return await db.query.member.findFirst({
      where(fields, { eq, and }) {
        return and(eq(fields.guildId, guildId), eq(fields.userId, userId));
      },
    });
  } catch (error) {
    throw new Error("Something went wrong while getting guild member");
  }
}

export async function deleteGuild(guildId: string) {
  try {
    await db.delete(guild).where(eq(guild.id, guildId)).execute();
    await db.delete(channel).where(eq(channel.guildId, guildId)).execute();
    await db.delete(member).where(eq(member.guildId, guildId)).execute();
  } catch (error) {
    throw new Error("Something went wrong while deleting guild");
  }
}

export async function deleteGuildMember(memberId: string) {
  try {
    await db
      .delete(member)
      .where(and(eq(member.id, memberId), not(eq(member.role, "owner"))))
      .execute();
  } catch (error) {
    throw new Error("Something went wrong while deleting guild member");
  }
}

export async function deleteChannel(channelId: string) {
  console.log("deleting channelId: ", channelId);
  try {
    await db.delete(channel).where(eq(channel.id, channelId)).execute();
  } catch (error) {
    throw new Error("Something went wrong while deleting channel");
  }
}

export async function getServerInvite(guildId: string) {
  try {
    const dbResult = await db
      .select()
      .from(invite)
      .where(eq(invite.guildId, guildId))
      .limit(1);

    return dbResult[0];
  } catch (error) {
    throw new Error("Something went wrong while getting server invite");
  }
}

export async function createServerInvite(guildId: string) {
  try {
    const inviteId = generateChannelId();
    await db.delete(invite).where(eq(invite.guildId, guildId)).execute();
    await db.insert(invite).values({ id: inviteId, guildId }).execute();
    return inviteId;
  } catch (error) {
    throw new Error("Something went wrong while creating server invite");
  }
}

export async function getInvite(inviteId: string) {
  try {
    return (
      await db
        .select({
          createdAt: invite.createdAt,
          guild: {
            id: guild.id,
            name: guild.name,
            createdAt: guild.createdAt,
          },
          imageUrl: uploadedImage.url,
          memberCount: sql<number>`count(member.id)`,
        })
        .from(invite)
        .innerJoin(guild, eq(invite.guildId, guild.id))
        .innerJoin(uploadedImage, eq(guild.image, uploadedImage.id))
        .innerJoin(member, eq(guild.id, member.guildId))
        .where(eq(invite.id, inviteId))
        .limit(1)
        .execute()
    )[0];
  } catch (error) {
    throw new Error("Something went wrong while getting invite");
  }
}

export async function getMember(memberId: string) {
  try {
    const member = await db.query.member.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, memberId);
      },
      columns: {
        id: false,
        guildId: false,
        userId: false,
        role: false,
        joinedAt: false,
      },
      with: {
        user: {
          columns: {
            emailVerified: false,
            hashedPassword: false,
            email: false,
          },
        },
      },
    });
    return member?.user || null;
  } catch (error) {
    throw new Error("Something went wrong while getting member");
  }
}

export async function addMemberToGuild(guildId: string, userId: string) {
  try {
    await db
      .insert(member)
      .values({ guildId, userId, role: "member" })
      .execute();
  } catch (error) {
    throw new Error("Something went wrong while adding member to guild");
  }
}

export async function getChannelMessages(
  channelId: string,
  limit: number,
  offset = 0,
) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.channelId, channelId))
      .orderBy(desc(message.createdAt))
      .limit(limit + 1)
      .offset(offset)
      .execute();
  } catch (error) {
    throw new Error("Something went wrong while getting channel messages");
  }
}

export async function updateMember(
  memberId: string,
  input: Partial<MemberInsert>,
) {
  try {
    await db.update(member).set(input).where(eq(member.id, memberId)).execute();
  } catch (error) {
    throw new Error("Something went wrong while updating member");
  }
}

export async function createConversation(input: ConversationInsert) {
  try {
    await db.insert(conversation).values(input).execute();
  } catch (error) {
    throw new Error("Something went wrong while creating conversation");
  }
}

export async function getConversationByUser2Id(user2Id: string) {
  try {
    return await db.query.conversation.findFirst({
      where(fields, { eq }) {
        return eq(fields.userTwoId, user2Id);
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while getting conversation");
  }
}
