const InvitePage = ({
  params,
}: {
  params: {
    inviteCode: string;
  };
}) => {
  return <div>{params.inviteCode}</div>;
};

export default InvitePage;
