"use client";

import { trpc } from "@/app/_trpc/client";
import { type ProcedureOutputs } from "@/app/_trpc/serverClient";
import Server from "./server";

type ServerListProps = {
  initialData: ProcedureOutputs["getGuilds"];
};

const ServerList = ({ initialData }: ServerListProps) => {
  const serverMutation = trpc.getGuilds.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initialData: initialData,
  });

  if (serverMutation.isLoading) return <div>loading...</div>;
  return (
    <div className="space-y-2 w-full">
      {serverMutation.data &&
        serverMutation.data.map((server) => {
          return <Server key={server.id} server={server} />;
        })}
    </div>
  );
};

export default ServerList;
