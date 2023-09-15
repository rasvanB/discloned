import { serverClient } from "@/app/_trpc/serverClient";
import JoinServerButton from "@/components/join-server-button";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";

export const revalidate = 3600;

const InvitePage = async ({
  params,
}: {
  params: {
    inviteCode: string;
  };
}) => {
  const inviteInfo = await serverClient.getInviteInfo(params.inviteCode);

  if (!inviteInfo) {
    return <div>Invalid invite code</div>;
  }

  return (
    <>
      <Toaster />
      <div
        className={
          "w-full sm:w-[500px] flex flex-col items-center px-10 bg-card py-4 gap-1 rounded-md"
        }
      >
        <Image
          src={inviteInfo.imageUrl}
          alt={"server icon"}
          width={60}
          height={60}
          className={"rounded-md w-[60px] h-[60px]"}
        />
        <div className={"text-xs text-muted-foreground"}>
          You were invited to join.
        </div>
        <div className={"text-lg font-medium"}>{inviteInfo.guild.name}</div>
        <div className={"text-sm text-muted-foreground"}>
          members:
          <span className={"text-sm ml-2"}>{inviteInfo.memberCount}</span>
        </div>
        <JoinServerButton guildId={inviteInfo.guild.id} />
      </div>
    </>
  );
};

export default InvitePage;
