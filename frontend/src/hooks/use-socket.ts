"use client";

import { io, type Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { MessageSelect } from "@/db/queries";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/app/_trpc/client";
import { useQueryClient } from "@tanstack/react-query";

const useSocket = ({ channelId }: { channelId: string }) => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (socket) return;

    const getSessionToken = async () => {
      const req = await fetch("/api/auth/token");
      const { sessionToken } = await req.json();
      if (!sessionToken) return null;
      return sessionToken as string;
    };

    getSessionToken().then((token) => {
      if (!token) return;
      const ioSocket = io("http://localhost:3030", {
        auth: {
          token,
        },
      });
      setSocket(ioSocket);
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("connected");
      socket.emit("subscribe", channelId);
    });

    socket.on("message", (message) => {
      console.log("message", message);
    });

    socket.on("new-message", async (message) => {
      const msg = message as MessageSelect;

      const messagesQueryKey = getQueryKey(
        trpc.getChannelMessages,
        {
          channelId,
        },
        "query",
      );

      await queryClient.setQueryData(messagesQueryKey, (oldData) => {
        if (!oldData) return [msg];
        return [msg, ...(oldData as Array<unknown>)];
      });

      console.log("new-message", message);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, channelId, queryClient]);

  return socket;
};

export default useSocket;
