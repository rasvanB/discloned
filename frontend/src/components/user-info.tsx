import { getServerAuthSession } from "@/lib/auth";
import { Avatar } from "./ui/avatar";
import Image from "next/image";
import UserSettings from "./user-settings";

const UserInfo = async () => {
  const session = await getServerAuthSession();
  if (!session) return null;

  return (
    <div className="h-14 gap-2 items-center border-t-[1px] border-border/60 flex px-2 leading-none bottom-0 left-0 absolute w-full z-10 bg-card">
      <Avatar className="w-[35px] h-auto">
        <Image
          src={session.user.image}
          alt={session.user.name}
          width={40}
          height={40}
          referrerPolicy="no-referrer"
        />
      </Avatar>
      <div className="w-full">
        <p className="max-w-[120px] truncate text-sm">{session.user.name}</p>
        <p className="text-xs">online</p>
      </div>
      <UserSettings />
    </div>
  );
};

export default UserInfo;
