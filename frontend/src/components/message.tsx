"use client";

import { ProcedureOutputs } from "@/app/_trpc/serverClient";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import Linkify from "linkify-react";

import "./message.css";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { chatInputSchema } from "@/components/chat-input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import { DEFAULT_USER_IMAGE_SRC } from "@/utils/constants";

const relativeDateFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  timeStyle: "short",
});

function capitalize(string: string) {
  if (!/^[a-zA-Z]/.test(string)) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatMessageDate(date: Date) {
  const today = new Date().setHours(24, 59, 59, 999);
  const daysPassed = Math.floor(
    (today - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysPassed > 2) return dateFormatter.format(date);
  return relativeDateFormatter.format(-1 * daysPassed, "day");
}

function formatMessageTime(date: Date) {
  return timeFormatter.format(date);
}

function formatMessageDateTime(date: Date) {
  return `${capitalize(formatMessageDate(date))} at ${formatMessageTime(date)}`;
}

const Message = ({
  message,
  memberId,
}: {
  message: ProcedureOutputs["getChannelMessages"][number];
  memberId: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      message: message.content,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    // TODO: Here update message mutation
    console.log(values.message);
  });

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

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        onCancelEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keyDown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isEditing) {
      form.setValue("message", message.content);
    }
  }, [isEditing]);

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
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X size={18} /> : <Pencil size={18} />}
          </Button>
          <Button variant={"outline"} size={"icon"} className={"bg-card"}>
            <Trash size={18} />
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
          <span className={"font-medium mr-2"}>{authorData.name}</span>
          <span className={"text-xs text-muted-foreground"}>
            {formatMessageDateTime(new Date(message.createdAt))}
          </span>
        </div>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={onSubmit}>
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
              <div className={"text-xs"}>
                escape to{" "}
                <Button
                  variant={"link"}
                  size={"sm"}
                  className={"px-1 text-xs"}
                  onClick={onCancelEdit}
                >
                  cancel
                </Button>
                • enter to{" "}
                <Button variant={"link"} size={"sm"} className={"px-1 text-xs"}>
                  edit
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className={"mt-1 message-content break-all"}>
            <Linkify
              options={{
                target: "_blank",
              }}
            >
              {message.content}
            </Linkify>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
