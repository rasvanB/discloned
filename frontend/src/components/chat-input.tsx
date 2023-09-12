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

type SelectedEmoji = {
  [key: PropertyKey]: unknown;
} & {
  native: string;
};

const chatInputSchema = z.object({
  message: z.string().nonempty(),
});

type FormValues = z.infer<typeof chatInputSchema>;

const ChatInput = () => {
  const form = useForm({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      message: "",
    },
  });

  const { systemTheme, theme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        className={"px-4 bg-background h-[70px] w-full flex items-start"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div
          className={
            "p-2 rounded flex outline outline-1 outline-input focus-within:ring-1 focus-within:ring-ring focus-within:outline-0 w-full disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          <Button variant={"ghost"} size={"icon"}>
            <PlusCircle size={24} />
          </Button>
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
  );
};

export default ChatInput;
