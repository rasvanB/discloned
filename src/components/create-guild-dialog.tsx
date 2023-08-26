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
import { ComponentProps, FormEventHandler, useState } from "react";
import { UploadDropzone } from "./uploadthing";

import "@uploadthing/react/styles.css";
import { cn } from "@/lib/utils";
import AuthAlert from "./auth-alert";
import { UploadFileResponse } from "uploadthing/client";
import { z } from "zod";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

const OpenDialogButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-[50px] h-[50px] rounded-full"
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
    uploadedImage: UploadFileResponse | null;
  }
) => {
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
          if (ready && props.uploadedImage) {
            return "File uploaded successfully!";
          }
        },
        allowedContent: ({ ready }) => {
          if (ready && props.uploadedImage) {
            return props.uploadedImage.name;
          }
        },
      }}
      {...props}
    />
  );
};

const serverNameSchmema = z.string().min(2).max(32);

const CreateGuildDialog = () => {
  const [serverName, setServerName] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<UploadFileResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const createGuildMutation = trpc.createGuild.useMutation({
    onSuccess: (result) => {
      if (!result) {
        setErrorMessage("There was an error creating your server");
        return;
      }
      // router.push(`/channels/${result.id}`);
    },
  });

  const error = createGuildMutation.error?.message || errorMessage;

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (!uploadedImage) {
      setErrorMessage("You must upload an image");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const result = serverNameSchmema.safeParse(serverName);

    if (!result.success) {
      setErrorMessage(result.error.message);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const { data: parsedServerName } = result;

    createGuildMutation.mutate({
      name: parsedServerName,
      imageId: uploadedImage.key,
    });
  };

  return (
    <Dialog
      onOpenChange={(c) => {
        if (!c) {
          setUploadedImage(null);
          setErrorMessage(null);
        }
      }}
    >
      <OpenDialogButton />
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <DialogHeader className="text-left">
            <DialogTitle>Create a Server</DialogTitle>
            <DialogDescription>
              {
                "Give your new server a personality with a name and an icon. You can always change it later."
              }
            </DialogDescription>
          </DialogHeader>
          {error && <AuthAlert variant="destructive" message={error} />}
          <div>
            <Label className="text-right">Server Icon</Label>

            <ImageUploader
              onClientUploadComplete={(files) => {
                if (!files || !files[0]) return;
                setUploadedImage(files[0]);
              }}
              uploadedImage={uploadedImage}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-right">Server Name</Label>
            <Input
              className="col-span-3"
              value={serverName}
              onChange={(e) => {
                setServerName(e.target.value);
              }}
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateGuildDialog;
