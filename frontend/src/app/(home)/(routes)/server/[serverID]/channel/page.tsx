import { redirect } from "next/navigation";

const ChannelPage = ({
  params,
}: {
  params: {
    serverID?: string;
  };
}) => {
  if (!params.serverID) redirect("/server/me");
  redirect(`/server/${params.serverID}/`);
};

export default ChannelPage;
