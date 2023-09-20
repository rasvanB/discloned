"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2 className={"text-xl mb-3"}>
        There was an error while getting your invite
      </h2>
      <Button onClick={() => router.back()}>
        <ArrowLeft size={16} className={"mr-2"} /> Go back
      </Button>
    </div>
  );
}
