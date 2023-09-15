import { FileImage, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateString } from "@/utils/string";

const AttachmentPreview = ({
  fileName,
  onClose,
}: {
  fileName: string;
  onClose: () => void;
}) => {
  return (
    <div
      className={
        "flex items-center gap-2 p-1 border-border border-[1px] rounded pl-2 w-fit"
      }
    >
      {fileName.includes("pdf") ? (
        <FileText size={20} strokeWidth={1.75} />
      ) : (
        <FileImage size={20} strokeWidth={1.75} />
      )}
      <span className={"text-sm whitespace-nowrap"}>
        {truncateString(fileName, 7, 7)}
      </span>
      <Button
        variant={"ghost"}
        size={"icon"}
        onClick={onClose}
        type={"button"}
        className={"w-7 h-7"}
      >
        <X size={16} />
      </Button>
    </div>
  );
};

export default AttachmentPreview;
