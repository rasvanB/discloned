import { ServerSideBar } from "@/components/side-bar";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import SideBarSkeleton from "@/components/skeletons/side-bar-skeleton";

const ServerLayout = ({
  params,
  children,
}: {
  params: { serverID?: string };
  children: React.ReactNode;
}) => {
  if (!params.serverID) return redirect("/");
  return (
    <div className="w-full h-full flex">
      <Suspense fallback={<SideBarSkeleton />}>
        <ServerSideBar serverId={params.serverID} />
      </Suspense>
      {children}
    </div>
  );
};

export default ServerLayout;
