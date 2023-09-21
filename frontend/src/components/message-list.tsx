"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import Message from "@/components/message";
import useSocket from "@/hooks/use-socket";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const MessageList = ({
  initialData,
  channelId,
  memberId,
}: {
  initialData: ProcedureOutputs["getChannelMessages"];
  channelId: string;
  memberId: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useSocket({ channelId });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    trpc.infiniteMessages.useInfiniteQuery(
      {
        channelId,
      },
      {
        initialData: {
          pages: [
            {
              items: initialData,
            },
          ],
          pageParams: [null],
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  useEffect(() => {
    ref?.current?.scrollIntoView({ behavior: "instant" });
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: "instant" });
    }, 500);
  }, [ref]);

  if (!data) return null;

  return (
    <div className={"flex flex-col-reverse gap-2"}>
      <div className={"h-4"} ref={ref} />
      {data.pages.map((page) => {
        return page.items.map((message) => {
          return (
            <Message message={message} key={message.id} memberId={memberId} />
          );
        });
      })}
      {hasNextPage && (
        <div className={"flex items-center justify-center"}>
          <Button
            className={"w-fit"}
            variant={"secondary"}
            size={"default"}
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage || isFetching}
          >
            {isFetchingNextPage || isFetching
              ? "Loading more messages..."
              : "Load more messages"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
