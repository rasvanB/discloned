import { redirect } from "next/navigation";
import { serverClient } from "@/app/_trpc/serverClient";

const ServerPage = async ({ params }: { params: { serverID?: string } }) => {
  if (!params.serverID) return redirect("/");
  if (params.serverID === "me") return <div>Dms page</div>;

  const channels = await serverClient.getChannelsForGuild(params.serverID);

  // this means user is not a member of the server
  if (!channels || !channels[0]) return redirect("/server/me");

  const firstChannel = channels[0];

  redirect(`/server/${params.serverID}/channel/${firstChannel.id}`);
};

export default ServerPage;
