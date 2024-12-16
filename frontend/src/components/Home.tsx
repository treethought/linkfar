"use client";
import { useAccount } from "wagmi";

import ConnectButton from "@/components/ConnectButton";
import CreateAccount from "@/components/CreateAccount";
import Account from "./Account";
import { useProfile } from "@/hooks/profile";

export default function Home() {
  const { address } = useAccount();
  const { hasProfile } = useProfile(address || "");

  if (hasProfile) {
    return <Account address={address} />;
  }
  return <Landing />;
}

function Landing() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile(address || "");
  return (
    <div className="w-full h-screen mx-auto bg-base-100 py-4 px-1">
      <div className="hero min-h-[60vh] bg-gradient-to-r">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-5xl font-bold mb-2">LinkFar</h1>
              <img src="/icon.svg" alt="LinkFar" className="w-1/2 mx-auto" />
              <p className="text-lg">
                Bring your links to Farcaster
              </p>
            </div>
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
