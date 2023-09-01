import { Skeleton } from "../ui/skeleton";

const SideBarSkeleton = () => {
  return (
    <div className="flex justify-between flex-col w-[250px] h-full bg-card border-r-[1px] border-border flex-shrink-0">
      <div className="h-12 p-3 border-b-[1px] border-border/60 flex items-center justify-between">
        <Skeleton className="w-[130px] h-[17px] rounded-lg"></Skeleton>
      </div>
      <div className="h-[55px] gap-2 items-center border-t-[1px] flex px-2 leading-none">
        <div>
          <Skeleton className="w-[35px] h-[35px] rounded-full"></Skeleton>
        </div>
        <div className="w-full">
          <Skeleton className="w-[130px] h-[17px] rounded-lg"></Skeleton>
          <Skeleton className="w-[80px] h-[15px] rounded-lg mt-1"></Skeleton>
        </div>
        <div>
          <Skeleton className="w-[35px] h-[35px] rounded-lg"></Skeleton>
        </div>
      </div>
    </div>
  );
};

export default SideBarSkeleton;
