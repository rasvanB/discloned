import { redirect } from "next/navigation";
import Messages from "@/components/messages";
import ChatInput from "@/components/chat-input";
import { serverClient } from "@/app/_trpc/serverClient";

const Page = async ({
  params,
}: {
  params: {
    serverID?: string;
    channelID?: string;
  };
}) => {
  if (!params.serverID) redirect("/server/me");
  if (!params.channelID) redirect(`/server/${params.serverID}/`);

  const member = await serverClient.getCurrentServerMember(params.serverID);
  const channel = await serverClient.getChannelInfo(params.channelID);

  if (!channel) redirect(`/server/${params.serverID}/`);
  if (!member) redirect("/server/me");

  return (
    <div className={"w-full flex flex-col bg-card/50"}>
      <Messages
        channelId={params.channelID}
        channelName={channel.name}
        memberId={member.id}
      />
      <ChatInput channelId={params.channelID} memberId={member.id} />
    </div>
  );
};

export default Page;
