import { DMsSideBar } from "@/components/side-bar";
import React, { Suspense } from "react";
import SideBarSkeleton from "@/components/skeletons/side-bar-skeleton";

const ServerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full flex">
      <Suspense fallback={<SideBarSkeleton />}>
        <DMsSideBar />
      </Suspense>
      {children}
    </div>
  );
};

export default ServerLayout;
