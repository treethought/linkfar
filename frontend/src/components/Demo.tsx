"use client";
import { useAccount } from "wagmi";

import ConnectButton from "@/components/ConnectButton";
import CreateAccount from "@/components/CreateAccount";
import Account from "./Account";
import { useProfile } from "@/hooks/profile";

export default function Demo() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile(address || "");

  return (
    <div className="w-full h-screen mx-auto py-4 px-1">
      <div className="flex flex-col items-center gap-4 ">
        <div className="flex flex-row w-full justify-between items-center gap-4 px-2">
          <h1 className="text-2xl font-bold text-center mb-4 primary-content">
            LinkFar
          </h1>
          {isConnected && (
            <div className="mb-4 ">
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 w-full">
        {(!hasProfile) ? <Landing /> : <Account address={address} />}
      </div>
    </div>
  );
}

function Landing() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile(address || "");
  return (
    <div className="w-full h-screen mx-auto bg-base-100 py-4 px-1">
      <div className="hero min-h-[60vh] bg-gradient-to-r">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">LinkFar</h1>
            <p className="py-4 text-lg">
              Bring your links to Farcaster
            </p>
            <div className="mt-4 flex flex-row justify-center">
              {!isConnected && <ConnectButton />}
              {isConnected && !hasProfile && <CreateAccount />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
