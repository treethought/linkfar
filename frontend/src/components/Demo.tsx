"use client";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import { useCallback, useEffect, useState } from "react";
import { useBlockNumber, useChainId } from "wagmi";

import ConnectButton, { truncMiddle } from "@/components/ConnectButton";
import CreateAccount from "@/components/CreateAccount";
import Account from "./Account";
import { registryAddress } from "@/generated";
import { useAccountContract } from "@/hooks/account";

export default function Demo() {
  const [isSDKLoaded, setSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isContextOpen, setContextOpen] = useState(false);
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const chainId = useChainId({});
  const { accountContract } = useAccountContract();

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <div className="w-full h-screen mx-auto py-4 px-1">
      <div className="flex flex-col items-center gap-4 ">
        <div className="flex flex-row w-full justify-between items-center gap-4 px-2">
          <h1 className="text-2xl font-bold text-center mb-4 primary-content">
            LinkFar
          </h1>
          <div className="mb-4 ">
            <ConnectButton />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        {!accountContract && <CreateAccount />}
      </div>
      <div className="flex flex-col items-center gap-4">
        <Account />
      </div>
    </div>
  );
}
