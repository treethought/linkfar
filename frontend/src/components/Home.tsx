"use client";
import { useAccount } from "wagmi";

import ConnectButton from "@/components/ConnectButton";
import CreateAccount from "@/components/CreateAccount";
import Account from "./Account";
import { useProfile } from "@/hooks/profile";
import Image from "next/image";
import { useInFrame } from "@/hooks/frame";
import sdk from "@farcaster/frame-sdk";
import IconSVG from "../assets/icon.svg";

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
  const { inFrame } = useInFrame();
  return (
    <div className="hero min-h-[60vh] bg-gradient-to-r">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold mb-2">LinkFar</h1>

            <div className="w-1/2 aspect-[2/3] mx-auto text-primary-accent">
              <IconSVG className="w-full h-full fill-current" />
            </div>

            {inFrame && (
              <button
                className="btn btn-outline text-primary m-1"
                onClick={() => sdk.actions.addFrame()}
              >
                Add Frame
              </button>
            )}
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
  );
}
