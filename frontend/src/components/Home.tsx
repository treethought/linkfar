"use client";
import { useAccount } from "wagmi";

import ConnectButton from "@/components/ConnectButton";
import CreateAccount from "@/components/CreateAccount";
import { useProfile } from "@/hooks/profile";
import { useInFrame } from "@/hooks/frame";
import IconSVG from "../assets/icon.svg";
import ProfilePage from "@/app/profile/page";
import FrameConnectButton from "./frame/FrameConnect";

export default function Home() {
  const { address } = useAccount();
  const { hasProfile } = useProfile(address || "");

  if (hasProfile) {
    return <ProfilePage />;
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
            <p className="text-lg">
              Bring your links to Farcaster
            </p>

            <div className="w-1/3 aspect-[2/3] mx-auto text-primary-accent">
              <IconSVG className="w-full h-full fill-current" />
            </div>

            <div className="flex flex-row justify-center items-center gap-4">
              {inFrame && <FrameConnectButton />}
              {!isConnected && <ConnectButton />}
              {!inFrame && isConnected && !hasProfile && <CreateAccount />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
