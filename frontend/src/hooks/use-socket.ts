"use client";

import { io, type Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { MessageSelect } from "@/db/queries";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/app/_trpc/client";
import { queryClient } from "@/app/_trpc/provider";
import { env } from "@/env.mjs";

const getMessagesQueryKey = (channelId: string) => {
  return getQueryKey(
    trpc.infiniteMessages,
    {
      channelId,
    },
    "infinite",
  );
};

type OldData =
  | {
      pages: Array<{
        items: Array<unknown>;
      }>;
    }
  | undefined;

export const addMessageToCache = (message: MessageSelect) => {
  const messagesQueryKey = getMessagesQueryKey(message.channelId);

  queryClient.setQueryData(messagesQueryKey, (oldData: OldData) => {
    if (!oldData || !oldData.pages || oldData.pages.length === 0) {
      return {
        pages: [
          {
            items: [message],
          },
        ],
      };
    }

    const pages = [...oldData.pages];

    if (!pages[0] || !pages[0].items || pages[0].items.length === 0) {
      return {
        ...oldData,
        pages: [
          {
            items: [message],
          },
        ],
      };
    }

    pages[0] = {
      ...pages[0],
      items: [message, ...pages[0].items],
    };

    return {
      ...oldData,
      pages,
    };
  });
};

const updateMessageInCache = (message: MessageSelect) => {
  const messagesQueryKey = getMessagesQueryKey(message.channelId);

  queryClient.setQueryData(messagesQueryKey, (oldData: OldData) => {
    if (!oldData || !oldData.pages || oldData.pages.length === 0)
      return oldData;

    const pages = oldData.pages.map((page) => {
      if (!page.items || page.items.length === 0) return page;

      const items = page.items.map((msg) => {
        if ((msg as MessageSelect).id === message.id) {
          return message;
        }
        return msg;
      });

      return {
        ...page,
        items,
      };
    });

    return {
      ...oldData,
      pages,
    };
  });
};

const deleteMessageFromCache = (messageId: string, channelId: string) => {
  const messagesQueryKey = getMessagesQueryKey(channelId);

  queryClient.setQueryData(messagesQueryKey, (oldData: OldData) => {
    if (!oldData || !oldData.pages || oldData.pages.length === 0)
      return oldData;

    const pages = oldData.pages.map((page) => {
      if (!page.items || page.items.length === 0) return page;

      const items = page.items.filter((msg) => {
        return (msg as MessageSelect).id !== messageId;
      });

      return {
        ...page,
        items,
      };
    });

    return {
      ...oldData,
      pages,
    };
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
      const ioSocket = io(env.NEXT_PUBLIC_BACKEND_URL, {
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

    socket.on("new-message", (message) => {
      addMessageToCache(message);
    });

    socket.on("message-update", (message) => {
      updateMessageInCache(message);
    });

    socket.on("message-delete", (messageId) => {
      deleteMessageFromCache(messageId, channelId);
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
