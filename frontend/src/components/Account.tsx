import { useState } from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import ConnectButton from "./ConnectButton";
import { useAccountData, useProfile } from "@/hooks/profile";
import { AccountForm } from "./AccountForm";
import CreateAccount from "./CreateAccount";

export default function Account() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <ConnectButton />;
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <ProfileDataView />
    </div>
  );
}

function ProfileDataView() {
  const { address } = useAccount();
  const { profile, isLoading, error } = useProfile(address);
  const { data, error: dataError, loading: dataLoading } = useAccountData(
    address || zeroAddress,
  );
  const [isEditing, setIsEditing] = useState(false);

  if (!profile || address === zeroAddress) {
    return null;
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

  if (!profile || profile.owner === zeroAddress) {
    return <CreateAccount />;
  }

  if (!data?.properties) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-4">
          <h1>Account Form</h1>
        </div>
        <AccountForm accountData={data} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full justify-center items-center gap-4 ">
      {isEditing
        ? <AccountForm accountData={data} onClose={() => setIsEditing(false)} />
        : (
          <>
            <div className="flex flex-row justify-center items-center gap-4">
              <h1>{data?.name || address || ""}</h1>
            </div>
          <div className="flex flex-col gap-4">
            {data?.properties &&
              Object.entries(data?.properties).map(([key, value]) => (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary w-64"
                >
                  {key}
                </a>
              ))}
          </div>
          </>
        )}
      <button className="btn" onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Done" : "Edit"}
      </button>
    </div>
  );
}
