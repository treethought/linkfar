"use client";
import ChainSwitcher from "@/components/ChainSwitcher";
import ConnectButton from "@/components/ConnectButton";
import ThemeController from "@/components/ThemeController";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import IconSVG from "../assets/icon.svg";

export default function NavBar() {
  const { isConnected } = useAccount();
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
    </div>
  );
}
