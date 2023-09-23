import {
  mysqlTable,
  primaryKey,
  varchar,
  int,
  text,
  index,
  unique,
  mysqlEnum,
  timestamp,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const generateChannelId = () =>
  Math.floor(Math.random() * Math.pow(10, 14)).toString();

export const account = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refreshToken: varchar("refresh_token", { length: 255 }),
    accessToken: varchar("access_token", { length: 255 }),
    expiresAt: int("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    idToken: text("id_token"),
    sessionState: varchar("session_state", { length: 255 }),
  },
  (table) => {
    return {
      accountProviderProviderAccountId: primaryKey(
        table.provider,
        table.providerAccountId,
      ),
    };
  },
);

export const channel = mysqlTable(
  "channel",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => generateChannelId()),
    name: varchar("name", { length: 255 }).notNull(),
    guildId: varchar("guildId", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["text", "voice", "video"])
      .default("text")
      .notNull(),
    createdAt: timestamp("createdAt", { fsp: 3, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => {
    return {
      guildIdx: index("guildIdx").on(table.guildId),
      unique: unique("unique").on(table.guildId, table.name),
    };
  },
);

export const conversation = mysqlTable(
  "conversation",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userOneId: varchar("userOneId", { length: 255 }).notNull(),
    userTwoId: varchar("userTwoId", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { fsp: 3, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => {
    return {
      unique: unique("unique").on(table.userOneId, table.userTwoId),
    };
  },
);

export const directMessage = mysqlTable("directMessage", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: varchar("conversationId", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  content: text("content").notNull(),
  fileUrl: varchar("fileUrl", { length: 255 }),
  createdAt: timestamp("createdAt", { fsp: 3, mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  editedAt: timestamp("editedAt", { fsp: 3, mode: "string" }),
});

export const guild = mysqlTable("guild", {
  id: varchar("id", { length: 255 })
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }),
  ownerId: varchar("ownerId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { fsp: 3, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const invite = mysqlTable("invite", {
  id: varchar("id", { length: 255 })
    .notNull()
    .$defaultFn(() => generateChannelId()),
  guildId: varchar("guildId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { fsp: 3, mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const member = mysqlTable(
  "member",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("userId", { length: 255 }).notNull(),
    guildId: varchar("guildId", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "member"])
      .default("member")
      .notNull(),
    joinedAt: timestamp("joinedAt", { fsp: 3, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => {
    return {
      userIdx: index("userIdx").on(table.userId),
      guildIdx: index("guildIdx").on(table.guildId),
      unique: unique("unique").on(table.userId, table.guildId),
    };
  },
);

export const message = mysqlTable(
  "message",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    memberId: varchar("memberId", { length: 255 }).notNull(),
    channelId: varchar("channelId", { length: 255 }).notNull(),
    content: text("content").notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }),
    createdAt: timestamp("createdAt", { fsp: 3, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    editedAt: timestamp("editedAt", { fsp: 3, mode: "string" }),
  },
  (table) => {
    return {
      memberIdx: index("memberIdx").on(table.memberId),
      channelIdx: index("channelIdx").on(table.channelId),
    };
  },
);

export const uploadedImage = mysqlTable("uploadedImage", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  url: varchar("url", { length: 255 }).notNull(),
});

export const user = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", { fsp: 3, mode: "string" }),
    hashedPassword: varchar("hashedPassword", { length: 255 }),
    image: varchar("image", { length: 255 }),
  },
  (table) => {
    return {
      userEmailUnique: unique("user_email_unique").on(table.email),
    };
  },
);

export const userRelations = relations(user, ({ many }) => ({
  guilds: many(guild),
}));

export const guildRelations = relations(guild, ({ one, many }) => ({
  owner: one(user, {
    fields: [guild.ownerId],
    references: [user.id],
  }),
  image: one(uploadedImage, {
    fields: [guild.image],
    references: [uploadedImage.id],
  }),
  members: many(member),
  channels: many(channel),
}));

export const channelRelations = relations(channel, ({ one }) => ({
  guild: one(guild, {
    fields: [channel.guildId],
    references: [guild.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  guild: one(guild, {
    fields: [member.guildId],
    references: [guild.id],
  }),
}));
