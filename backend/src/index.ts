import express from "express";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import * as http from "http";
import cors from "cors";
import { decode } from "next-auth/jwt";
import { z } from "zod";
import prisma from "./lib/prisma.js";
import { randomUUID } from "crypto";

dotenv.config();

type EventsMap = {
  [eventName: string]: (...args: unknown[]) => void;
} & {
  subscribe: (room: string) => void;
};

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

type UserData = {
  id: string;
  name: string;
  email: string;
  picture: string;
};

type SocketData = {
  user: UserData;
};

const messageBodySchema = z.object({
  memberId: z.string().nonempty(),
  content: z.string().nonempty().max(2000),
  channelId: z.string().nonempty(),
  fileUrl: z.string().optional(),
});

const io = new Server<EventsMap, EventsMap, EventsMap, SocketData>(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  const token: string | undefined = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("invalid token"));
  }
  try {
    const userJWT = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
    });

    if (!userJWT || Date.now() > (userJWT.exp as number) * 1000) {
      return next(new Error("invalid token"));
    }

    socket.data.user = {
      id: userJWT.sub,
      name: userJWT.name,
      email: userJWT.email,
      picture: userJWT.picture,
    };
  } catch (e) {
    return next(new Error("invalid token"));
  }

  next();
});

const useAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const bearerToken = req.headers.authorization.split("Bearer ")[1];

  if (!bearerToken) {
    return res.status(401).json({
      error: "unauthorized",
    });
  }

  try {
    const userJWT = await decode({
      token: bearerToken,
      secret: process.env.AUTH_SECRET!,
    });

    if (!userJWT || Date.now() > (userJWT.exp as number) * 1000) {
      return res.status(401).json({
        error: "unauthorized",
      });
    }
    console.log(userJWT);

    res.locals.user = {
      id: userJWT.sub,
      name: userJWT.name,
      email: userJWT.email,
    };
  } catch (error) {
    return res.status(401).json({
      error: "unauthorized",
    });
  }
  next();
};

app.post("/messages", useAuth, async (req, res) => {
  const result = messageBodySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "invalid message body",
    });
  }

  const { memberId, content, channelId, fileUrl } = result.data;

  try {
    const server = await prisma.guild.findFirst({
      where: {
        member: {
          some: {
            id: memberId,
          },
        },
        channel: {
          some: {
            id: channelId,
          },
        },
      },
    });

    if (!server) {
      return res.status(400).json({
        error: "not member of channel",
      });
    }

    const instertResult = await prisma.message.create({
      data: {
        id: randomUUID(),
        channelId,
        content,
        fileUrl,
        memberId,
        createdAt: new Date(),
      },
    });

    io.to(channelId).emit("new-message", instertResult);

    return res.status(200).json({
      message: "message sent",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

const messageUpdateSchema = z.object({
  memberId: z.string().nonempty(),
  content: z.string().nonempty().max(2000),
  channelId: z.string().nonempty(),
  fileUrl: z.string().nullable(),
});

app.patch("/messages/:id", useAuth, async (req, res) => {
  const result = messageUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "invalid message body",
    });
  }

  const { memberId, content, channelId, fileUrl } = result.data;
  const messageId = req.params.id;

  try {
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) {
      return res.status(400).json({
        error: "not member of channel",
      });
    }

    if (member.role === "admin" || member.role === "owner") {
      const updatedMessage = await prisma.message.update({
        where: {
          id: messageId,
        },
        data: {
          content,
          fileUrl,
          editedAt: new Date(),
        },
      });

      io.to(channelId).emit("message-update", updatedMessage);

      return res.status(200).json({
        message: "message updated",
      });
    }

    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
        memberId,
      },
      data: {
        content,
        fileUrl,
        editedAt: new Date(),
      },
    });

    io.to(channelId).emit("message-update", updatedMessage);

    return res.status(200).json({
      message: "message updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

const messageDeleteSchema = z.object({
  memberId: z.string().nonempty(),
  channelId: z.string().nonempty(),
});

app.delete("/messages/:id", useAuth, async (req, res) => {
  const result = messageDeleteSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "invalid message body",
    });
  }

  const { memberId, channelId } = result.data;
  const messageId = req.params.id;

  try {
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) {
      return res.status(400).json({
        error: "not member of channel",
      });
    }

    if (member.role === "admin" || member.role === "owner") {
      await prisma.message.delete({
        where: {
          id: messageId,
        },
      });

      io.to(channelId).emit("message-delete", messageId);

      return res.status(200).json({
        message: "message deleted",
      });
    }

    await prisma.message.delete({
      where: {
        id: messageId,
        memberId,
      },
    });

    io.to(channelId).emit("message-delete", messageId);

    return res.status(200).json({
      message: "message deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

io.on("connection", (socket) => {
  console.log(`${socket.data.user.name} connected`);

  socket.on("subscribe", (message) => {
    console.log(`${socket.data.user.name} connected to ${message}`);
    socket.join(message);
  });
});

server.listen(3030, () => {
  console.log("listening on *:3030");
});
