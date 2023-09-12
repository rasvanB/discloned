import { redirect } from "next/navigation";
import Messages from "@/components/messages";
import ChatInput from "@/components/chat-input";

const Page = ({
  params,
}: {
  params: {
    serverID?: string;
    channelID?: string;
  };
}) => {
  if (!params.serverID) redirect("/server/me");
  if (!params.channelID) redirect(`/server/${params.serverID}/`);

  return (
    <div className={"w-full flex flex-col"}>
      <Messages channelId={params.channelID} />
      <ChatInput />
    </div>
  );
};

export default Page;
