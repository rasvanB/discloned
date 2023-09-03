"use client";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/hooks/use-modal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AuthAlert from "@/components/auth-alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { queryClient } from "@/app/_trpc/provider";
import { getQueryKey } from "@trpc/react-query";
import { useRouter } from "next/navigation";

const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name must be at least 1 character long",
    })
    .max(100, {
      message: "Channel name must be at most 100 characters long",
    }),
  type: z.enum(["text", "voice", "video"]),
});

type CreateChannelSchema = z.infer<typeof createChannelSchema>;

const types: Array<CreateChannelSchema["type"]> = ["text", "voice", "video"];

const CreateChannelModal = () => {
  const form = useForm<CreateChannelSchema>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      type: "text",
    },
  });

  const { modal, isOpen, onClose } = useModal();

  const onCloseModal = () => {
    form.reset();
    onClose();
  };

  const isModalOpen = modal.type === "createChannel" && isOpen;

  const router = useRouter();

  const createChannelMutation = trpc.createChannel.useMutation({
    onSuccess: async (createdChannelId) => {
      if (modal.type !== "createChannel") return;
      const queryKey = getQueryKey(
        trpc.getChannelsForGuild,
        modal.state.guildId,
        "query",
      );
      await queryClient.invalidateQueries(queryKey);
      router.push(`/server/${modal.state.guildId}/channel/${createdChannelId}`);
      onCloseModal();
    },
  });

  const onSubmit: SubmitHandler<CreateChannelSchema> = (values) => {
    if (modal.type !== "createChannel") return;
    createChannelMutation.mutate({
      ...values,
      guildId: modal.state.guildId,
    });
  };

  const errorMessage =
    form.formState.errors.name?.message ||
    form.formState.errors.type?.message ||
    createChannelMutation.error?.message;

  return (
    <Dialog open={isModalOpen} onOpenChange={onCloseModal}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="text-left">
              <DialogTitle>Create a Channel</DialogTitle>
            </DialogHeader>
            {errorMessage && (
              <AuthAlert variant="destructive" message={errorMessage} />
            )}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-right">Channel Name</Label>
                    <FormControl>
                      <Input className="col-span-3" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Channel Type</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value[0]?.toUpperCase() +
                              field.value.slice(1) || "Select language"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="sm:w-[375px] p-0">
                        <Command>
                          <CommandGroup>
                            {types.map((type) => (
                              <CommandItem
                                value={type}
                                key={type}
                                onSelect={() => {
                                  form.setValue("type", type);
                                }}
                              >
                                {type[0]?.toUpperCase() + type.slice(1)}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    type === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createChannelMutation.isLoading}>
                {createChannelMutation.isLoading && (
                  <RotateCw size={15} className="animate-spin mr-2" />
                )}
                {createChannelMutation.isLoading
                  ? "Creating channel..."
                  : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
