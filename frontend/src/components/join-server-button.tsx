"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const JoinServerButton = ({ guildId }: { guildId: string }) => {
  const { toast } = useToast();
  const router = useRouter();
  const { mutate, isLoading } = trpc.addServerMember.useMutation({
    onSuccess: () => {
      router.push(`/server/${guildId}`);
    },
    onError: () => {
      toast({
        title: "Failed to join server",
        description: "You might already be a member of this server",
      });
    },
  });

  return (
    <>
      <Button
        onClick={() => mutate(guildId)}
        disabled={isLoading}
        className={"w-full max-w-[300px] mt-2"}
      >
        Join server
      </Button>
    </>
  );
};

export default JoinServerButton;
