"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import Linkify from "linkify-react";

import "./message.css";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import { DEFAULT_USER_IMAGE_SRC } from "@/utils/constants";
import { formatMessageDateTime } from "@/utils/date-time";
import { z } from "zod";
import AttachmentPreview from "@/components/attachment-preview";
import MessageAttachment from "@/components/message-attachment";
import Link from "next/link";

const messageSchema = z.object({
  message: z.string().nonempty().max(2000),
  fileUrl: z.string().nullable(),
});

type MessageSchema = z.infer<typeof messageSchema>;

const MessageEditForm = ({
  message,
  memberId,
  onCancelEdit,
  onSubmitSuccess,
}: {
  message: ProcedureOutputs["getChannelMessages"][number];
  memberId: string;
  onCancelEdit: () => void;
  onSubmitSuccess: () => void;
}) => {
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: message.content,
      fileUrl: message.fileUrl,
    },
  });

  const updateMessageMutation = trpc.updateMessage.useMutation({
    onSuccess: () => {
      onCancelEdit();
    },
  });

  const onSubmit: SubmitHandler<MessageSchema> = async (data) => {
    if (data.message === message.content && data.fileUrl === message.fileUrl) {
      onCancelEdit();
      return;
    }
    await updateMessageMutation.mutateAsync({
      messageId: message.id,
      content: data.message,
      fileUrl: data.fileUrl,
      memberId,
      channelId: message.channelId,
    });
    onSubmitSuccess();
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        onCancelEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keyDown", handleKeyDown);
  });

  const shouldBeDisabled =
    form.formState.isSubmitting || updateMessageMutation.isLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <input type="submit" hidden disabled={shouldBeDisabled} />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className={"w-full"}>
              <FormControl>
                <Input
                  placeholder={"Edit message"}
                  className={
                    "text-[16px] mt-2 break-words py-2 h-[35px] scrollbar-none shadow-none"
                  }
                  {...field}
                  autoComplete={"off"}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileUrl"
          render={({ field }) => (
            <FormItem className={"w-full mt-1"}>
              <FormControl>
                {field.value && (
                  <AttachmentPreview
                    fileName={field.value}
                    onClose={() => {
                      form.setValue("fileUrl", null);
                    }}
                  />
                )}
              </FormControl>
            </FormItem>
          )}
        />
        <div className={"text-xs"}>
          escape to
          <Button
            variant={"link"}
            size={"sm"}
            className={"px-1 text-xs"}
            onClick={onCancelEdit}
          >
            cancel
          </Button>
          • enter to
          <Button
            variant={"link"}
            size={"sm"}
            className={"px-1 text-xs"}
            type={"submit"}
            autoFocus={true}
            disabled={shouldBeDisabled}
          >
            edit
          </Button>
        </div>
      </form>
    </Form>
  );
};

const Message = ({
  message,
  memberId,
}: {
  message: ProcedureOutputs["getChannelMessages"][number];
  memberId: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onCancelEdit = () => {
    setIsEditing(false);
  };

  const { data: authorData, isLoading } = trpc.getMemberById.useQuery(
    message.memberId,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const deleteMessageMutation = trpc.deleteMessage.useMutation({
    onSuccess: () => {
      onCancelEdit();
    },
  });

  if (!authorData || isLoading) return null;

  const isAuthor = message.memberId === memberId;

  const shouldShowButtons = (isHovered || isEditing) && isAuthor;

  return (
    <div
      className={clsx(
        "relative flex gap-3 hover:bg-accent py-2 px-4 group",
        isEditing && "ring-1 ring-primary",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {shouldShowButtons && (
        <div
          className={
            "z-10 absolute space-x-1 right-4 -top-4 group-hover:block hidden text-secondary-foreground/80"
          }
          style={{ display: isEditing ? "block" : "initial" }}
        >
          <Button
            variant={"outline"}
            size={"icon"}
            className={"bg-card"}
            onClick={() => {
              if (isEditing) {
                onCancelEdit();
                return;
              }
              setIsEditing(true);
            }}
          >
            {isEditing ? <X size={18} /> : <Pencil size={18} />}
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className={"bg-card"}
            onClick={() => {
              deleteMessageMutation.mutate({
                messageId: message.id,
                memberId,
                channelId: message.channelId,
              });
            }}
          >
            {deleteMessageMutation.isLoading ? (
              <Loader2 size={18} className={"animate-spin"} />
            ) : (
              <Trash size={18} />
            )}
          </Button>
        </div>
      )}
      <Image
        src={authorData.image || DEFAULT_USER_IMAGE_SRC}
        alt={"user_avatar"}
        width={40}
        height={40}
        className={"rounded-full w-[40px] h-[40px]"}
      />
      <div className={"flex flex-col w-full"}>
        <div className={"leading-none"}>
          {isAuthor ? (
            <span className={"font-medium mr-2"}>{authorData.name}</span>
          ) : (
            <Link href={`/server/me/conversation/${authorData.id}`}>
              <span className={"font-medium mr-2"}>{authorData.name}</span>
            </Link>
          )}
          <span className={"text-xs text-muted-foreground"}>
            {formatMessageDateTime(new Date(message.createdAt))}
          </span>
        </div>
        {isEditing ? (
          <MessageEditForm
            message={message}
            memberId={memberId}
            onCancelEdit={onCancelEdit}
            onSubmitSuccess={onCancelEdit}
          />
        ) : (
          <div className={"flex flex-col gap-2"}>
            <div className={"mt-1 message-content break-all"}>
              <Linkify
                options={{
                  target: "_blank",
                }}
              >
                {message.content}
              </Linkify>
              {message.editedAt && (
                <span className={"text-xs text-muted-foreground"}>
                  {" (edited)"}
                </span>
              )}
            </div>
            {message.fileUrl && <MessageAttachment fileUrl={message.fileUrl} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
