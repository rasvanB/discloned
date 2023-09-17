import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  text,
  mysqlEnum,
  index,
  unique,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";
import { v4 } from "uuid";

export const generateChannelId = () =>
  Math.floor(Math.random() * Math.pow(10, 14)).toString();

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => v4()),
  name: varchar("name", { length: 255 }).notNull(),
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
  }),
);

export const uploadedImages = mysqlTable("uploadedImage", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  url: varchar("url", { length: 255 }).notNull(),
});

export const guilds = mysqlTable("guild", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => v4()),
  name: varchar("name", { length: 255 }).notNull(),
  imageId: varchar("image", { length: 255 }),
  ownerId: varchar("ownerId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", fsp: 3 })
    .notNull()
    .defaultNow(),
});

export const channels = mysqlTable(
  "channel",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generateChannelId()),
    name: varchar("name", { length: 255 }).notNull(),
    guildId: varchar("guildId", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date", fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    type: mysqlEnum("type", ["text", "voice", "video"])
      .notNull()
      .default("text"),
  },
  (channel) => {
    return {
      guildIdx: index("guildIdx").on(channel.guildId),
      uniqueNameGuildId: unique("unique").on(channel.guildId, channel.name),
    };
  },
);

export const invites = mysqlTable("invite", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => generateChannelId()),
  guildId: varchar("guildId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", fsp: 3 })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const members = mysqlTable(
  "member",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => v4()),
    userId: varchar("userId", { length: 255 }).notNull(),
    guildId: varchar("guildId", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "member"])
      .notNull()
      .default("member"),
    joinedAt: timestamp("joinedAt", { mode: "date", fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (member) => {
    return {
      userIdx: index("userIdx").on(member.userId),
      guildIdx: index("guildIdx").on(member.guildId),
      uniqueUserGuild: unique("unique").on(member.userId, member.guildId),
    };
  },
);

export const messages = mysqlTable(
  "message",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => v4()),

    memberId: varchar("memberId", { length: 255 }).notNull(),
    channelId: varchar("channelId", { length: 255 }).notNull(),

    content: text("content").notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }),

    createdAt: timestamp("createdAt", { mode: "date", fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),

    editedAt: timestamp("editedAt", { mode: "date", fsp: 3 }),
  },
  (message) => {
    return {
      memberIdx: index("memberIdx").on(message.memberId),
      channelIdx: index("channelIdx").on(message.channelId),
    };
  },
);

export const conversations = mysqlTable(
  "conversation",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generateChannelId()),

    userOneId: varchar("userOneId", { length: 255 }).notNull(),
    userTwoId: varchar("userTwoId", { length: 255 }).notNull(),

    createdAt: timestamp("createdAt", { mode: "date", fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (conversations) => {
    return {
      userOneIdx: index("userOneIdx").on(conversations.userOneId),
      userTwoIdx: index("userTwoIdx").on(conversations.userTwoId),
      uniqueUserOneUserTwo: unique("unique").on(
        conversations.userOneId,
        conversations.userTwoId,
      ),
    };
  },
);

export const directMessages = mysqlTable(
  "directMessage",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => v4()),
    conversationId: varchar("conversationId", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    content: text("content").notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }),
    createdAt: timestamp("createdAt", { mode: "date", fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    editedAt: timestamp("editedAt", { mode: "date", fsp: 3 }),
  },
  (directMessage) => {
    return {
      conversationIdx: index("conversationIdx").on(
        directMessage.conversationId,
      ),
      userIdx: index("userIdx").on(directMessage.userId),
    };
  },
);

export const userRelations = relations(users, ({ many }) => ({
  guilds: many(guilds),
}));

export const guildRelations = relations(guilds, ({ one, many }) => ({
  owner: one(users, {
    fields: [guilds.ownerId],
    references: [users.id],
  }),
  image: one(uploadedImages, {
    fields: [guilds.imageId],
    references: [uploadedImages.id],
  }),
  members: many(members),
  channels: many(channels),
}));

export const channelRelations = relations(channels, ({ one }) => ({
  guild: one(guilds, {
    fields: [channels.guildId],
    references: [guilds.id],
  }),
}));

export const memberRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  guild: one(guilds, {
    fields: [members.guildId],
    references: [guilds.id],
  }),
}));
