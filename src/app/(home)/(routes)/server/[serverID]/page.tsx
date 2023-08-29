import SideBar from "@/components/side-bar";
import SideBarSkeleton from "@/components/skeletons/side-bar";
import { redirect } from "next/navigation";

export default async function Server({
  params,
}: {
  params: { serverID?: string };
}) {
  if (!params.serverID) return redirect("/");
  return (
    <div className="w-full h-full flex">
      {/* <SideBar>
        <p>yo</p>
      </SideBar> */}
      <SideBarSkeleton />
      yo this is the server {params.serverID}
    </div>
  );
}
