import { Skeleton } from "@/components/ui/skeleton";

const MemberListSkeleton = () => {
  return (
    <div className={"w-full px-4 mt-5"}>
      <div className={"flex items-center justify-between"}>
        <Skeleton className={"w-[140px] h-[20px]"}></Skeleton>
        <Skeleton className={"w-[20px] h-[20px]"}></Skeleton>
      </div>
      <div className={"flex items-center justify-between mt-2"}>
        <div className={"flex items-center gap-2"}>
          <Skeleton className={"w-[35px] h-[35px] rounded-full"}></Skeleton>
          <Skeleton className={"w-[95px] h-[20px] rounded-full"}></Skeleton>
        </div>
        <Skeleton className={"w-[45px] h-[15px] rounded-full"}></Skeleton>
      </div>
      <div className={"flex items-center justify-between mt-2"}>
        <div className={"flex items-center gap-2"}>
          <Skeleton className={"w-[35px] h-[35px] rounded-full"}></Skeleton>
          <Skeleton className={"w-[95px] h-[20px] rounded-full"}></Skeleton>
        </div>
        <Skeleton className={"w-[45px] h-[15px] rounded-full"}></Skeleton>
      </div>
      <div className={"flex items-center justify-between mt-2"}>
        <div className={"flex items-center gap-2"}>
          <Skeleton className={"w-[35px] h-[35px] rounded-full"}></Skeleton>
          <Skeleton className={"w-[95px] h-[20px] rounded-full"}></Skeleton>
        </div>
        <Skeleton className={"w-[45px] h-[15px] rounded-full"}></Skeleton>
      </div>
    </div>
  );
};

export default MemberListSkeleton;
