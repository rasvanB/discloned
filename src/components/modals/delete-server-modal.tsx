"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { getQueryKey } from "@trpc/react-query";
import { queryClient } from "@/app/_trpc/provider";

const DeleteServerModal = () => {
  const { modal, isOpen, onClose } = useModal();
  const isModalOpen = modal.type === "deleteServer" && isOpen;

  const router = useRouter();

  const { isLoading, mutate } = trpc.deleteServer.useMutation({
    onSuccess: async () => {
      const getGuildsQueryKey = getQueryKey(trpc.getGuilds, undefined, "query");
      await queryClient.invalidateQueries(getGuildsQueryKey);
      router.push("/server/me");
      onClose();
    },
  });

  if (modal.type !== "deleteServer") return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className={"text-left"}>
          <DialogTitle>Delete Server</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this server? This action is
            irreversible and will permanently remove all channels, messages, and
            members associated with the server.
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
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
