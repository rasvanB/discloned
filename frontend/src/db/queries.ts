import { and, desc, eq, sql, not } from "drizzle-orm";
import { db } from ".";
import {
  channels,
  generateChannelId,
  guilds,
  invites,
  members,
  messages,
  uploadedImages,
  users,
} from "./schema";

type ImageInsert = typeof uploadedImages.$inferInsert;

export async function insertImageToDb(input: ImageInsert) {
  try {
    await db.insert(uploadedImages).values(input).execute();
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

type GuildInsert = typeof guilds.$inferInsert;
type GuildSelect = typeof guilds.$inferSelect;
type ChannelInsert = typeof channels.$inferInsert;
type UserInsert = typeof users.$inferInsert;
type MemberInsert = typeof members.$inferInsert;

export type MessageSelect = typeof messages.$inferSelect;

export async function insertGuildToDb(input: GuildInsert) {
  try {
    const executedQuery = await db.insert(guilds).values(input);
    console.log("INSERT ID: ", executedQuery.insertId);
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

export async function getUserGuild(userId: GuildSelect["ownerId"]) {
  try {
    const guild = await db
      .select({
        id: guilds.id,
      })
      .from(guilds)
      .where(eq(guilds.ownerId, userId))
      .orderBy(desc(guilds.createdAt))
      .limit(1);

    if (!guild.length) {
      console.log("no guilds found");
      return;
    }

    return guild[0];
  } catch (error) {
    throw new Error("Something went wrong while getting user guild");
  }
}

export async function getUserGuilds(userId: string) {
  try {
    return await db
      .select({
        id: guilds.id,
        name: guilds.name,
        image: {
          id: uploadedImages.id,
          url: uploadedImages.url,
        },
      })
      .from(guilds)
      .innerJoin(members, eq(guilds.id, members.guildId))
      .innerJoin(uploadedImages, eq(guilds.imageId, uploadedImages.id))
      .where(eq(members.userId, userId));
  } catch (error) {
    throw new Error("Something went wrong while getting user guilds");
  }
}

export async function getUserGuildById(userId: string, guildId: string) {
  try {
    return await db.query.guilds.findFirst({
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
        imageId: false,
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
      .insert(channels)
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
        id: channels.id,
        name: channels.name,
        type: channels.type,
        guildId: channels.guildId,
        createdAt: channels.createdAt,
      })
      .from(channels)
      .leftJoin(members, eq(channels.guildId, members.guildId))
      .where(and(eq(members.userId, userId), eq(channels.guildId, guildId)))
      .orderBy(desc(channels.createdAt));
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong while getting guild channels");
  }
}

export async function getChannelById(channelId: string) {
  try {
    return await db.query.channels.findFirst({
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
    await db.insert(users).values(input);
  } catch (error) {
    throw new Error("Something went wrong while creating user");
  }
}

export async function getUserByEmail(email: string) {
  try {
    const dbResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = dbResult[0];

    if (!user) {
      console.log("no users found");
      return;
    }

    return user;
  } catch (error) {
    throw new Error("Something went wrong while getting user by email");
  }
}

export async function doesUserExist(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId);
      },
      columns: {
        id: true,
        email: false,
        hashedPassword: false,
        emailVerified: false,
        name: false,
      },
    });
    return Boolean(user);
  } catch (error) {
    return false;
  }
}
export async function createGuildMember(input: MemberInsert) {
  try {
    await db.insert(members).values(input);
  } catch (error) {
    throw new Error("Something went wrong while creating member");
  }
}

export async function getGuildMembers(guildId: string) {
  try {
    return await db
      .select({
        id: members.id,
        userId: members.userId,
        role: members.role,
        joinedAt: members.joinedAt,
        user: {
          name: users.name,
          image: users.image,
          email: users.email,
        },
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(eq(members.guildId, guildId));
  } catch (error) {
    throw new Error("Something went wrong while getting guild members");
  }
}

export async function getGuildMemberByUserId(guildId: string, userId: string) {
  try {
    return await db.query.members.findFirst({
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
    await db.delete(guilds).where(eq(guilds.id, guildId)).execute();
    await db.delete(channels).where(eq(channels.guildId, guildId)).execute();
    await db.delete(members).where(eq(members.guildId, guildId)).execute();
  } catch (error) {
    throw new Error("Something went wrong while deleting guild");
  }
}

export async function deleteGuildMember(memberId: string) {
  try {
    await db
      .delete(members)
      .where(and(eq(members.id, memberId), not(eq(members.role, "owner"))))
      .execute();
  } catch (error) {
    throw new Error("Something went wrong while deleting guild member");
  }
}

export async function getServerInvite(guildId: string) {
  try {
    const dbResult = await db
      .select()
      .from(invites)
      .where(eq(invites.guildId, guildId))
      .limit(1);

    return dbResult[0];
  } catch (error) {
    throw new Error("Something went wrong while getting server invite");
  }
}

export async function createServerInvite(guildId: string) {
  try {
    const inviteId = generateChannelId();
    await db.delete(invites).where(eq(invites.guildId, guildId)).execute();
    await db.insert(invites).values({ id: inviteId, guildId }).execute();
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
          createdAt: invites.createdAt,
          guild: {
            id: guilds.id,
            name: guilds.name,
            createdAt: guilds.createdAt,
          },
          imageUrl: uploadedImages.url,
          memberCount: sql<number>`count(member.id)`,
        })
        .from(invites)
        .innerJoin(guilds, eq(invites.guildId, guilds.id))
        .innerJoin(uploadedImages, eq(guilds.imageId, uploadedImages.id))
        .innerJoin(members, eq(guilds.id, members.guildId))
        .where(eq(invites.id, inviteId))
        .limit(1)
        .execute()
    )[0];
  } catch (error) {
    throw new Error("Something went wrong while getting invite");
  }
}

export async function getMember(memberId: string) {
  try {
    const member = await db.query.members.findFirst({
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
            id: false,
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
      .insert(members)
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
      .from(messages)
      .where(eq(messages.channelId, channelId))
      .orderBy(desc(messages.createdAt))
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
    await db
      .update(members)
      .set(input)
      .where(eq(members.id, memberId))
      .execute();
  } catch (error) {
    throw new Error("Something went wrong while updating member");
  }
}
