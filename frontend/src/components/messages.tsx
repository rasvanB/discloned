import { serverClient } from "@/app/_trpc/serverClient";
import MessageList from "@/components/message-list";

const Messages = async ({ channelId }: { channelId: string }) => {
  const messages = await serverClient.getChannelMessages({ channelId });

  const channelMessages = messages.map((message) => {
    return {
      ...message,
      createdAt: message.createdAt.toString(),
      editedAt: message.editedAt?.toString() || null,
    };
  });

  return (
    <div
      className={
        "overflow-y-auto scrollbar-thin scrollbar-track-muted/50 scrollbar-thumb-muted-foreground/50 mr-1 h-full pt-6"
      }
    >
      <MessageList initialData={channelMessages} channelId={channelId} />
    </div>
  );
};

export default Messages;
