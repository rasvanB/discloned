import Image from "next/image";
import { FileText } from "lucide-react";
import { truncateString } from "@/utils/string";

const MessageAttachment = ({ fileUrl }: { fileUrl: string }) => {
  const isFileImage = !fileUrl.includes("pdf");
  const isImageGif = fileUrl.endsWith(".gif");
  if (isFileImage)
    return (
      <div className={"w-full md:w-[500px] relative"}>
        <Image
          src={fileUrl}
          alt={"message_image"}
          sizes={"100vw"}
          width={0}
          height={0}
          loading={"eager"}
          priority
          unoptimized={isImageGif}
          className={"w-auto h-auto max-h-[400px] rounded"}
        />
      </div>
    );

  const cleanFileName = fileUrl
    .replace("https://", "")
    .replace("http://", "")
    .replace("uploadthing.com/f/", "");

  return (
    <a
      className={
        "w-full flex items-center p-3 rounded outline outline-1 outline-border hover:ring-blue-500 hover:ring-1 hover:outline-0"
      }
      target={"_blank"}
      href={fileUrl}
    >
      <FileText size={40} className={"mr-2 text-blue-500"} />
      <div className={"flex flex-col leading-none gap-1"}>
        <span className={"text-blue-500"}>PDF File</span>
        <span className={"text-blue-500"}>
          {truncateString(cleanFileName, 10, 7)}
        </span>
      </div>
    </a>
  );
};

export default MessageAttachment;
