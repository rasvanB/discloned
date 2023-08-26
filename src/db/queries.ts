import { eq } from "drizzle-orm";
import { db } from ".";
import { guilds, uploadedImages, userRelations, users } from "./schema";

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

export async function insertGuildToDb(input: GuildInsert) {
  try {
    await db.insert(guilds).values(input).execute();
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
      .limit(1);

    if (!guild.length) {
      throw new Error("Could not find guild");
    }

    return guild[0];
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

export async function getUserGuilds(userId: string) {
  try {
    const userGuilds = await db.query.guilds.findMany({
      where(fields, operators) {
        return operators.eq(fields.ownerId, userId);
      },
    });
    return userGuilds;
  } catch (error) {}
}
