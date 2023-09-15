import { serverClient } from "@/app/_trpc/serverClient";
import MessageList from "@/components/message-list";
import ChannelGreeting from "@/components/channel-greeting";

const Messages = async ({
  channelId,
  channelName,
  memberId,
}: {
  channelId: string;
  channelName: string;
  memberId: string;
}) => {
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
        "overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-track-muted/50 scrollbar-thumb-muted-foreground/50 mr-1 h-full pt-6"
      }
    >
      <ChannelGreeting channelName={channelName} />
      <MessageList
        initialData={channelMessages}
        channelId={channelId}
        memberId={memberId}
      />
    </div>
  );
};

export default Messages;
