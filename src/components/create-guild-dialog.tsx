"use client";

import { PlusIcon, RotateCw } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import { ComponentProps, useState } from "react";
import { UploadDropzone } from "./uploadthing";

import "@uploadthing/react/styles.css";
import { cn } from "@/lib/utils";
import AuthAlert from "./auth-alert";
import { UploadFileResponse } from "uploadthing/client";
import { z } from "zod";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { getQueryKey } from "@trpc/react-query";
import { queryClient } from "@/app/_trpc/provider";

const OpenDialogButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-[50px] h-[50px] rounded-full mt-2"
              onClick={onClick}
            >
              <PlusIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side={"left"}>
          <p>Create a Server</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ImageUploader = (
  props: Omit<ComponentProps<typeof UploadDropzone>, "endpoint"> & {
    onChange: (file?: string) => void;
  }
) => {
  const [uploadedImage, setUploadedImage] = useState<UploadFileResponse | null>(
    null
  );
  return (
    <UploadDropzone
      endpoint="imageUploader"
      appearance={{
        label: "text-primary hover:text-primary/80",
        container: "border-2 border-dashed border-foreground-muted",
        button: cn(
          buttonVariants({ size: "sm", variant: "default" }),
          "ut-uploading:bg-primary/90 ut-readying:bg-primary/90 after:bg-primary/0"
        ),
      }}
      content={{
        label: ({ ready }) => {
          if (ready && uploadedImage) {
            return "File uploaded successfully!";
          }
        },
        allowedContent: ({ ready }) => {
          if (ready && uploadedImage) {
            return uploadedImage.name;
          }
        },
      }}
      onClientUploadComplete={(files) => {
        if (!files || !files[0]) return;
        props.onChange(files[0].key);
        setUploadedImage(files[0]);
      }}
      {...props}
    />
  );
};

const createGuildSchema = z.object({
  name: z.string().min(3).max(32),
  imageId: z
    .string()
    .nonempty({ message: "You have to upload an image for the Server Icon" }),
});

type CreateGuildSchema = z.infer<typeof createGuildSchema>;

const CreateGuildDialog = () => {
  const form = useForm<CreateGuildSchema>({
    resolver: zodResolver(createGuildSchema),
    defaultValues: {
      name: "",
      imageId: "",
    },
  });

  const router = useRouter();

  const createGuildMutation = trpc.createGuild.useMutation({
    onSuccess: (result) => {
      if (!result) return;
      const getGuildsQueryKey = getQueryKey(trpc.getGuilds, undefined, "query");
      queryClient.invalidateQueries(getGuildsQueryKey);

      router.push(`/server/${result.id}`);
    },
  });

  const onSubmit: SubmitHandler<CreateGuildSchema> = (e) => {
    createGuildMutation.mutate({
      name: e.name,
      imageId: e.imageId,
    });
  };

  const errorMessage =
    form.formState.errors.imageId?.message ||
    form.formState.errors.name?.message ||
    createGuildMutation.error?.message;

  return (
    <Dialog
      onOpenChange={(openState) => {
        if (!openState) {
          form.reset();
        }
      }}
    >
      <OpenDialogButton />
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="text-left">
              <DialogTitle>Create a Server</DialogTitle>
              <DialogDescription>
                {
                  "Give your new server a personality with a name and an icon. You can always change it later."
                }
              </DialogDescription>
            </DialogHeader>
            {errorMessage && (
              <AuthAlert variant="destructive" message={errorMessage} />
            )}
            <div>
              <Label className="text-right">Server Icon</Label>
              <FormField
                control={form.control}
                name="imageId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploader {...field} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-right">Server Name</Label>
                    <FormControl>
                      <Input className="col-span-3" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createGuildMutation.isLoading}>
                {createGuildMutation.isLoading && (
                  <RotateCw size={15} className="animate-spin mr-2" />
                )}
                {createGuildMutation.isLoading
                  ? "Creating server..."
                  : "Create server"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGuildDialog;
