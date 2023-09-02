import { and, desc, eq } from "drizzle-orm";
import { db } from ".";
import { channels, guilds, members, uploadedImages, users } from "./schema";

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
    return await db.query.guilds.findMany({
      where(fields, { eq }) {
        return eq(fields.ownerId, userId);
      },
      columns: {
        imageId: false,
        ownerId: false,
        createdAt: false,
      },
      with: {
        image: true,
      },
    });
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
    const executedQuery = await db.insert(channels).values(input).execute();
    console.log("INSERT ID: ", executedQuery.insertId);
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
      })
      .from(channels)
      .leftJoin(members, eq(channels.guildId, members.guildId))
      .where(and(eq(members.userId, userId), eq(channels.guildId, guildId)));
  } catch (error) {
    throw new Error("Something went wrong while getting guild channels");
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

export async function createServerMember(input: MemberInsert) {
  try {
    await db.insert(members).values(input);
  } catch (error) {
    throw new Error("Something went wrong while creating member");
  }
}
