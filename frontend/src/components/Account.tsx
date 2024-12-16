import { useState } from "react";
import { Address, zeroAddress } from "viem";
import { useAccount, useEnsName } from "wagmi";
import { useAccountData, useProfile } from "@/hooks/profile";
import { AccountForm } from "./AccountForm";
import ProfileAvatar from "./ProfileAvatar";

export type Props = {
  address?: Address;
};

export default function Account(props: Props) {
  const { address } = props;
  const { address: connectedAddress } = useAccount();
  const { profile, hasProfile, isLoading, error } = useProfile(address);
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data, loading: dataLoading } = useAccountData(
    address || zeroAddress,
  );

  // TODO: should use privy linked account for verifiaction
  const isOwner = hasProfile && connectedAddress === profile?.owner &&
    profile?.owner !== zeroAddress;

  const name = () => {
    if (data?.name) {
      return data.name;
    }
    if (ensName) {
      return ensName.toString();
    }
    return address;
  };
  useAccountData(
    address || zeroAddress,
  );
  const [isEditing, setIsEditing] = useState(false);

  if (!hasProfile) {
    // show no profile found 404
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-4">
          <h1>Account Not Found</h1>
        </div>
      </div>
    );
  }

  if (isLoading || dataLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-full">
        <span className="loading loading-lg">Loading</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div className="flex-1">
          <label>Error:</label>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data?.properties && isOwner) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-4">
        </div>
        <AccountForm accountData={data} profileSlug={profile?.slug} />
      </div>
    );
  }
  if (isEditing && isOwner) {
    return (
      <div className="flex flex-col w-full md:w-1/2 justify-center items-center gap-4 ">
        <AccountForm
          accountData={data}
          profileSlug={profile?.slug}
          onClose={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full md:w-1/2 justify-center items-center gap-4 ">
      <div className="flex flex-col w-full justify-center items-center gap-4">
        <ProfileAvatar address={address as string} className="w-12" />
        <article className="prose text-center">
          <h2>{name()}</h2>
          <p>{data?.description}</p>
        </article>
      </div>
      <div className="divider" />
      <div className="flex flex-col gap-4">
        {data?.properties &&
          Object.entries(data?.properties).map(([key, value]) => (
            value && (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary w-64"
              >
                {key}
              </a>
            )
          ))}
      </div>
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
