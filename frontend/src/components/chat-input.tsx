"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/components/ui/use-toast";
import ChatAttachmentsModal from "@/components/modals/chat-attachments-modal";
import { useModal } from "@/hooks/use-modal";
import { useState } from "react";
import { UploadFileResponse } from "uploadthing/client";
import AttachmentPreview from "@/components/attachment-preview";

export type SelectedEmoji = {
  [key: PropertyKey]: unknown;
} & {
  native: string;
};

export const chatInputSchema = z.object({
  message: z.string().nonempty().max(2000),
  fileUrl: z.string().optional(),
});

export type FormValues = z.infer<typeof chatInputSchema>;

const ChatInput = ({
  memberId,
  channelId,
}: {
  memberId: string;
  channelId: string;
}) => {
  const [attachment, setAttachment] = useState<UploadFileResponse | null>(null);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      message: "",
      fileUrl: "",
    },
  });

  const { onOpen } = useModal();

  const sendMessageMutation = trpc.sendMessage.useMutation({
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "An error occurred while sending your message.",
      });
    },
  });

  const { systemTheme, theme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    form.reset();
    setAttachment(null);
    await sendMessageMutation.mutateAsync({
      channelId,
      memberId,
      content: data.message,
      fileUrl: data.fileUrl,
    });
  };

  const isInvalid = !form.formState.isValid && form.formState.isDirty;

  return (
    <>
      <ChatAttachmentsModal
        onSuccessfulAttachment={(file) => {
          setAttachment(file);
          form.setValue("fileUrl", file.url);
        }}
      />
      <Form {...form}>
        <form
          className={
            "px-4 h-[70px] w-full flex items-start justify-center z-[1]"
          }
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div
            className={
              "p-2 rounded flex items-center gap-1 bg-card outline outline-1 outline-input focus-within:ring-1 focus-within:ring-ring focus-within:outline-0 w-full disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => {
                onOpen({
                  type: "chatAttachment",
                  state: null,
                });
              }}
              type={"button"}
            >
              <PlusCircle size={24} />
            </Button>
            {attachment && (
              <AttachmentPreview
                fileName={attachment.name}
                onClose={() => {
                  setAttachment(null);
                  form.setValue("fileUrl", "");
                }}
              />
            )}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className={"w-full"}>
                  <FormControl>
                    <Input
                      placeholder={"Send message"}
                      className={
                        "text-[16px] border-0 focus-visible:ring-0 break-words py-2 h-[35px] scrollbar-none shadow-none"
                      }
                      {...field}
                      autoComplete={"off"}
                      style={
                        isInvalid
                          ? {
                              color: "#de4d43",
                            }
                          : {}
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                  <Smile size={24} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className={"p-0 border-none mr-5"} side={"top"}>
                <Picker
                  onEmojiSelect={(e: SelectedEmoji) => {
                    form.setValue(
                      "message",
                      form.getValues("message") + e.native,
                    );
                  }}
                  theme={currentTheme}
                  skinTonePosition={"search"}
                />
              </PopoverContent>
            </Popover>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ChatInput;
