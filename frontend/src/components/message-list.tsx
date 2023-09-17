"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import Message from "@/components/message";
import useSocket from "@/hooks/use-socket";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

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
  const { ref: inViewRef, inView } = useInView({
    threshold: 1,
    delay: 500,
    rootMargin: "500px",
  });

  const { isConnected } = useSocket({ channelId });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.infiniteMessages.useInfiniteQuery(
      {
        channelId,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  useEffect(() => {
    if (data && data.pages && data.pages.length > 1) return;
    ref?.current?.scrollIntoView({ behavior: "instant" });
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: "instant" });
    }, 500);
  }, [data, ref]);

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (!data) return null;

  console.log({ inView, isFetchingNextPage, hasNextPage });
  const allData = data.pages.map((page) => page.items).flat();

  if (!allData) return null;

  return (
    <div className={"flex flex-col-reverse gap-2"}>
      <div className={"h-4"} ref={ref} />
      {allData.map((message) => {
        return (
          <Message message={message} key={message.id} memberId={memberId} />
        );
      })}
      {hasNextPage && <div className={"h-4"} ref={inViewRef}></div>}
    </div>
  );
};

// const MessageList = ({
//   initialData,
//   channelId,
//   memberId,
// }: {
//   initialData: ProcedureOutputs["getChannelMessages"];
//   channelId: string;
//   memberId: string;
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//
//   const { isConnected } = useSocket({ channelId });
//
//   const { data } = trpc.getChannelMessages.useQuery(
//     {
//       channelId,
//     },
//     {
//       initialData,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//     },
//   );
//
//   useEffect(() => {
//     ref?.current?.scrollIntoView({ behavior: "instant" });
//     setTimeout(() => {
//       ref?.current?.scrollIntoView({ behavior: "instant" });
//     }, 500);
//   }, [data, ref]);
//
//   if (!data) return null;
//
//   return (
//     <div className={"flex flex-col-reverse gap-2"}>
//       <div className={"h-4"} ref={ref} />
//       {data.map((message) => {
//         return (
//           <Message message={message} key={message.id} memberId={memberId} />
//         );
//       })}
//     </div>
//   );
// };

export default MessageList;
