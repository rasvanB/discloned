import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  text,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";
import { randomUUID } from "crypto";

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  hashedPassword: varchar("hashedPassword", { length: 255 }),
  image: varchar("image", { length: 255 }),
});

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const uploadedImages = mysqlTable("uploadedImage", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  url: varchar("url", { length: 255 }).notNull(),
});

export const guilds = mysqlTable("guild", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  imageId: varchar("image", { length: 255 }),
  ownerId: varchar("ownerId", { length: 255 }).notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  guilds: many(guilds),
}));

export const guildRelations = relations(guilds, ({ one }) => ({
  owner: one(users, {
    fields: [guilds.ownerId],
    references: [users.id],
  }),
  image: one(uploadedImages, {
    fields: [guilds.imageId],
    references: [uploadedImages.id],
  }),
}));
