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
  content: z.string().nonempty(),
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

    console.log("USER FROM THE SERVER", userJWT);
  } catch (e) {
    return next(new Error("invalid token"));
  }

  next();
});

app.post("/messages", async (req, res) => {
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
