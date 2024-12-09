"use client";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useBlockNumber,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi";

import ConnectButton, { truncMiddle } from "@/components/ConnectButton";
import CreateAccount from "@/components/CreateAccount";
import Account from "./Account";
import { registryAddress } from "@/generated";

export default function Demo() {
  const [isSDKLoaded, setSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isContextOpen, setContextOpen] = useState(false);
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const chainId = useChainId({});

  const { address } = useAccount();

  useEffect(() => {
    if (!context) {
      return;
    }
  }, [context, address]);

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

  const toggleContext = useCallback(() => {
    setContextOpen((prev) => !prev);
  }, []);

  return (
    <div className="w-full h-screen mx-auto py-4 px-1">
      <div className="flex flex-col items-center gap-4 ">
        <div className="flex flex-row w-full justify-between items-center gap-4 px-2">
          <h1 className="text-2xl font-bold text-center mb-4 primary-content">
            LinkFar
          </h1>
          <div className="mb-4">
            <span>
              Registry address:{" "}
              <pre>{truncMiddle(registryAddress[31337], 12)}</pre>
            </span>
          </div>
          <div className="mb-4">
            <span>
              <pre>{truncMiddle(registryAddress[31337], 12)}</pre>
            </span>
          </div>
          <div className="mb-4">
            <span>
              Chain ID: <pre>{chainId}</pre>
            </span>
          </div>
          <div className="mb-4">
            <span>
              Block Number: <pre>{Number(blockNumber)}</pre>
            </span>
          </div>
          <div className="mb-4 ">
            <ConnectButton />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <CreateAccount />
      </div>
      <div className="flex flex-col items-center gap-4">
        <Account />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Frame Context</h2>
          <button
            onClick={toggleContext}
            className="flex items-center gap-2 transition-colors btn"
          >
            <span
              className={`transform transition-transform ${
                isContextOpen ? "rotate-90" : ""
              }`}
            >
              ➤
            </span>
            Tap to expand
          </button>
          {isContextOpen && (
            <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                {JSON.stringify(context, null, 2)}
              </pre>
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
              </pre>
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
              </pre>
            </div>
          )}
          <div>
          </div>
        </div>
      </div>
      {" "}
    </div>
  );
}