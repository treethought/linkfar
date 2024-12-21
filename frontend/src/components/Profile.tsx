import { useState } from "react";
import { Address, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useAccountData, useProfile } from "@/hooks/profile";
import { AccountForm } from "./AccountForm";
import AccountView from "./profile/AccountView";

export type Props = {
  address?: Address;
};

export default function Profile(props: Props) {
  const { address } = props;
  const { address: connectedAddress } = useAccount();
  const { profile, hasProfile, isLoading } = useProfile(address);
  const { data, loading: dataLoading } = useAccountData(
    address || connectedAddress || zeroAddress,
  );
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = connectedAddress === profile?.owner &&
    profile?.owner !== zeroAddress;

  if (isLoading || dataLoading) {
    return <div className="loading loading-bars" />;
  }
  if (isEditing) {
    return (
      <div className="flex flex-col w-full md:w-1/2 mx-auto justify-center items-center gap-4 border ">
        <AccountForm
          accountData={data}
          profileSlug={profile?.slug}
          onClose={() => setIsEditing(false)}
        />
      </div>
    );
  }
  if (!isLoading && (!hasProfile || !data)) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-4">
          <h1>Account Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full md:w-1/2 mx-auto justify-center items-center gap-4 border ">
      <AccountView accountData={data!} profile={profile} />
      {isOwner && (
        <button
          className="btn"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
      )}
    </div>
  );
}
