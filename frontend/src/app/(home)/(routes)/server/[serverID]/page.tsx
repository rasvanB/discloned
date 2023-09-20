import { redirect } from "next/navigation";
import { serverClient } from "@/app/_trpc/serverClient";

const ServerPage = async ({ params }: { params: { serverID?: string } }) => {
  if (!params.serverID) return redirect("/");

  const channels = await serverClient.getChannelsForGuild(params.serverID);

  // this means user is not a member of the server
  if (!channels || !channels[0]) return redirect("/server/me");

  const generalChannel = channels.find((c) => c.name === "general");
  const firstChannel = channels[0];

  const channel = generalChannel || firstChannel;

  redirect(`/server/${params.serverID}/channel/${channel.id}`);
};

export default ServerPage;
