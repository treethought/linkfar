"use client";

import ChainSwitcher from "@/components/ChainSwitcher";
import ConnectButton from "@/components/ConnectButton";
import ThemeController from "@/components/ThemeController";
import { useFrameContext } from "@/hooks/frame";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";

const Home = dynamic(() => import("@/components/Home"), {
  ssr: false,
});

export function NavBar() {
  const { isConnected } = useAccount();
  return (
    <div className="flex flex-row w-full justify-between items-center gap-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4 primary-content">
        LinkFar
      </h1>
      <div className="flex flex-row items-center gap-4">
        <ChainSwitcher />
        <ThemeController />
        {isConnected && (
          <div className="mb-4 ">
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const {} = useFrameContext();
  return (
    <main className="min-h-screen flex flex-col p-4">
      <div className="w-full h-screen mx-auto py-4 px-1">
        <div className="flex flex-col items-center gap-4 w-full">
          <NavBar />
          <Home />
        </div>
      </div>
    </main>
  );
}
