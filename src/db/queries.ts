import { desc, eq } from "drizzle-orm";
import { db } from ".";
import { channels, guilds, uploadedImages } from "./schema";

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
        return and(eq(fields.id, guildId), eq(fields.ownerId, userId));
      },
      with: {
        channels: true,
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

export async function getGuildChannels(guildId: string) {
  try {
    return await db.query.channels.findMany({
      where(fields, { eq }) {
        return eq(fields.guildId, guildId);
      },
      columns: {
        guildId: false,
      },
    });
  } catch (error) {
    throw new Error("Something went wrong while getting guild channels");
  }
}
