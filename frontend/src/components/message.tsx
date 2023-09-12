"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";

const relativeDateFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  timeStyle: "short",
});

function capitalize(string: string) {
  if (!/^[a-zA-Z]/.test(string)) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatMessageDate(date: Date) {
  const today = new Date().setHours(24, 59, 59, 999);
  const daysPassed = Math.floor(
    (today - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysPassed > 2) return dateFormatter.format(date);
  return relativeDateFormatter.format(-1 * daysPassed, "day");
}

function formatMessageTime(date: Date) {
  return timeFormatter.format(date);
}

function formatMessageDateTime(date: Date) {
  return `${capitalize(formatMessageDate(date))} at ${formatMessageTime(date)}`;
}

const Message = ({
  message,
}: {
  message: ProcedureOutputs["getChannelMessages"][number];
}) => {
  const { data: authorData, isLoading } = trpc.getMemberById.useQuery(
    message.memberId,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  if (!authorData || isLoading) return null;

  return (
    <div className={"flex gap-3"}>
      <Image
        src={authorData.image || "default_photo"}
        alt={"user_avatar"}
        width={40}
        height={40}
        className={"rounded-full w-[40px] h-[40px]"}
      />
      <div className={"flex flex-col w-full"}>
        <div className={"leading-none"}>
          <span className={"font-medium mr-2"}>{authorData.name}</span>
          <span className={"text-xs text-muted-foreground"}>
            {formatMessageDateTime(new Date(message.createdAt))}
          </span>
        </div>
        <div className={"mt-1"}>{message.content}</div>
      </div>
    </div>
  );
};

export default Message;
