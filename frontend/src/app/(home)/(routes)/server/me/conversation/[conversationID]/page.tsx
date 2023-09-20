import { redirect } from "next/navigation";

const Page = async ({
  params,
}: {
  params: {
    conversationID?: string;
  };
}) => {
  if (!params.conversationID) redirect(`/server/me/`);

  return (
    <div className={"w-full flex flex-col bg-card/50"}>
      conversation {params.conversationID}
    </div>
  );
};

export default Page;
