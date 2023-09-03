import { redirect } from "next/navigation";

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
    <div>
      <h1>Channel {params.channelID}</h1>
    </div>
  );
};

export default Page;
