"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useModal } from "@/hooks/use-modal";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { getQueryKey } from "@trpc/react-query";
import { queryClient } from "@/app/_trpc/provider";

const LeaveServerModal = () => {
  const { modal, isOpen, onClose } = useModal();
  const isModalOpen = modal.type === "leaveServer" && isOpen;

  const router = useRouter();

  const { isLoading, mutate } = trpc.leaveServer.useMutation({
    onSuccess: async () => {
      const getGuildsQueryKey = getQueryKey(trpc.getGuilds, undefined, "query");
      await queryClient.invalidateQueries(getGuildsQueryKey);
      router.push("/server/me");
      onClose();
    },
  });

  if (modal.type !== "leaveServer") return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className={"text-left"}>
          <DialogTitle>Leave Server</DialogTitle>
          <DialogDescription>
            {
              "Are you sure you want to leave this server? Once you leave, you wil lose access to its channels and content, and you'll need an invitation to rejoin."
            }
          </DialogDescription>
        </DialogHeader>
        <div className={"w-full flex justify-end items-center gap-2"}>
          <Button variant={"secondary"} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            disabled={isLoading}
            onClick={() => {
              mutate(modal.state.guildId);
            }}
          >
            {isLoading && (
              <RotateCw size={16} className={"mr-2 animate-spin"} />
            )}
            {isLoading ? "Leaving..." : "Leave"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveServerModal;
