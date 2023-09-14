"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useModal } from "@/hooks/use-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { ComponentProps, useEffect, useState } from "react";
import { UploadDropzone } from "@/components/uploadthing";
import { cn } from "@/lib/utils";
import { UploadFileResponse } from "uploadthing/client";
import AuthAlert from "@/components/auth-alert";

const AttachmentsUploader = (
  props: Omit<ComponentProps<typeof UploadDropzone>, "endpoint"> & {
    onChange: (file: UploadFileResponse) => void;
  },
) => {
  const [uploadedFile, setUploadedFile] = useState<UploadFileResponse | null>(
    null,
  );
  return (
    <UploadDropzone
      endpoint="attachmentUploader"
      appearance={{
        label: "text-primary hover:text-primary/80",
        container: "border-2 border-dashed border-foreground-muted",
        button: cn(
          buttonVariants({ size: "sm", variant: "default" }),
          "ut-uploading:bg-primary/90 ut-readying:bg-primary/90 after:bg-primary/0",
        ),
      }}
      content={{
        label: ({ ready }) => {
          if (ready && uploadedFile) {
            return "File uploaded successfully!";
          }
        },
        allowedContent: ({ ready, fileTypes }) => {
          if (ready && uploadedFile) {
            return uploadedFile.name;
          }
          return `${fileTypes.join(", ")} \n (Max size: 2MB)`;
        },
      }}
      onClientUploadComplete={(files) => {
        if (!files || !files[0]) return;
        props.onChange(files[0]);
        setUploadedFile(files[0]);
      }}
      {...props}
    />
  );
};

const ChatAttachmentsModal = ({
  onSuccessfulAttachment,
}: {
  onSuccessfulAttachment: (file: UploadFileResponse) => void;
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadFileResponse | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, [error]);

  const { modal, isOpen, onClose } = useModal();
  const isModalOpen = modal.type === "chatAttachment" && isOpen;
  if (modal.type !== "chatAttachment") return null;

  const onModalClose = () => {
    onClose();
    setUploadedFile(null);
    setError(null);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onModalClose}>
      <DialogContent>
        <DialogHeader className={"text-left"}>
          <DialogTitle>Add Attachments</DialogTitle>
          <DialogDescription>
            {
              "Please select the file you want to attach to this chat. You can choose from images or PDF documents."
            }
          </DialogDescription>
        </DialogHeader>
        {error && <AuthAlert variant={"destructive"} message={error} />}
        <AttachmentsUploader
          onChange={setUploadedFile}
          onUploadError={(e) => {
            setError(e.message);
            console.log(e);
          }}
        />
        <div className={"w-full flex justify-end items-center gap-2"}>
          <Button variant={"secondary"} onClick={onClose}>
            Cancel
          </Button>
          {uploadedFile && (
            <Button
              onClick={() => {
                onSuccessfulAttachment(uploadedFile);
                onClose();
              }}
            >
              Create Attachment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatAttachmentsModal;
