import SideBarSkeleton from "@/components/skeletons/side-bar";

export default function Loading() {
  return (
    <div className="w-full h-full flex">
      <SideBarSkeleton />
      <h1>Loading...</h1>
    </div>
  );
}
