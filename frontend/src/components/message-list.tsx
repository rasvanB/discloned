"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import Message from "@/components/message";
import useSocket from "@/hooks/use-socket";
import { useEffect, useRef } from "react";

const MessageList = ({
  initialData,
  channelId,
}: {
  initialData: ProcedureOutputs["getChannelMessages"];
  channelId: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useSocket({ channelId });

  const { data } = trpc.getChannelMessages.useQuery(
    {
      channelId,
    },
    {
      initialData,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    ref?.current?.scrollIntoView({ behavior: "instant" });
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: "instant" });
    }, 500);
  }, [data, ref]);

  if (!data) return null;

  return (
    <div className={"flex flex-col-reverse gap-5 px-4"}>
      <div className={"h-4"} ref={ref} />
      {data.map((message) => {
        return <Message message={message} key={message.id} />;
      })}
    </div>
  );
};

export default MessageList;
