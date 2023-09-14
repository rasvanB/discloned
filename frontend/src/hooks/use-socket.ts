"use client";

import { io, type Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { MessageSelect } from "@/db/queries";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/app/_trpc/client";
import { queryClient } from "@/app/_trpc/provider";

export const addMessageToCache = async (message: MessageSelect) => {
  const messagesQueryKey = getQueryKey(
    trpc.getChannelMessages,
    {
      channelId: message.channelId,
    },
    "query",
  );

  await queryClient.setQueryData(messagesQueryKey, (oldData) => {
    if (!oldData) return [message];
    return [message, ...(oldData as Array<unknown>)];
  });
};

const updateMessageInCache = async (message: MessageSelect) => {
  const messagesQueryKey = getQueryKey(
    trpc.getChannelMessages,
    {
      channelId: message.channelId,
    },
    "query",
  );

  await queryClient.setQueryData(messagesQueryKey, (oldData) => {
    if (!oldData) return [];
    return (oldData as Array<unknown>).map((msg) => {
      if ((msg as MessageSelect).id === message.id) {
        return message;
      }
      return msg;
    });
  });
};

const deleteMessageFromCache = async (messageId: string, channelId: string) => {
  const messagesQueryKey = getQueryKey(
    trpc.getChannelMessages,
    {
      channelId,
    },
    "query",
  );

  await queryClient.setQueryData(messagesQueryKey, (oldData) => {
    if (!oldData) return [];
    return (oldData as Array<unknown>).filter(
      (msg) => (msg as MessageSelect).id !== messageId,
    );
  });
};

const useSocket = ({ channelId }: { channelId: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
      setIsConnected(true);
      socket.emit("subscribe", channelId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("new-message", async (message) => {
      await addMessageToCache(message);
    });

    socket.on("message-update", async (message) => {
      await updateMessageInCache(message);
    });

    socket.on("message-delete", async (messageId) => {
      await deleteMessageFromCache(messageId, channelId);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, channelId, queryClient]);

  return {
    socket,
    isConnected,
  };
};

export default useSocket;
