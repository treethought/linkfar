"use client";
import ConnectButton from "@/components/ConnectButton";
import ThemeController from "@/components/ThemeController";
import { useAccount } from "wagmi";
import Link from "next/link";
import IconSVG from "../assets/icon.svg";
import { BookmarkPlus } from "lucide-react";
import { useFrameContext, useInFrame } from "@/hooks/frame";
import sdk from "@farcaster/frame-sdk";

export default function NavBar() {
  const { isConnected } = useAccount();
  const { inFrame } = useInFrame();
  const { context } = useFrameContext();
  return (
    <div className="flex flex-row w-full justify-between items-center gap-4 py-2">
      {/* Logo and Text as Link */}
      <Link
        href="/"
        className="flex flex-row items-center gap-2 text-primary-content"
      >
        <div className="w-8 h-8 mx-auto text-primary">
          {/* Set the size via CSS */}
          <IconSVG className="w-full h-full fill-current" />
        </div>
        <h1 className="text-xl font-bold text-primary">LinkFar</h1>
      </Link>

      {/* Right-Side Controls */}
      <div className="flex flex-row items-center gap-4">
        <ThemeController />
        {isConnected && (
          <div>
            <ConnectButton />
          </div>
        )}
      </div>
      {inFrame && !context?.client.added && (
        <div className="fixed bottom-5 right-5">
          <button
            className="btn btn-accent btn-circle shadow-lg"
            onClick={() => sdk.actions.addFrame()}
          >
            <BookmarkPlus size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
