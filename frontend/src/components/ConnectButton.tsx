import { useProxyAddress } from "@/hooks/contract";
import { useInFrame } from "@/hooks/frame";
import sdk from "@farcaster/frame-sdk";
import farcasterFrame from "@farcaster/frame-wagmi-connector";
import { useConnectWallet, usePrivy } from "@privy-io/react-auth";
import * as React from "react";
import { useChainId, useConnect } from "wagmi";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { inFrame } = useInFrame();
  const { connect } = useConnect();

  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      console.log("Connected account", wallet);
    },
    onError: (error) => {
      console.error("Failed to connect wallet", error);
    },
  });

  const disableLogin = !ready || (ready && authenticated);

  return (
    <div className="flex flex-row gap-4">
      <button
        className="btn btn-primary"
        disabled={disableLogin}
        onClick={() => connectWallet()}
      >
        Log in
      </button>
      {inFrame && (
        <button
          className="btn btn-primary"
          onClick={() => connect({ connector: farcasterFrame() })}
        >
          Frame Login
        </button>
      )}
    </div>
  );
}

export default function ConnectButton() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <AccountOptions />;
  }
  return <LoginButton />;
}

export function AccountOptions() {
  const { logout } = usePrivy();
  const chainId = useChainId({});
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1 });
  const proxyAddress = useProxyAddress();

  const disconnectAndLogout = async () => {
    await logout();
    disconnect();
  };

  const shortAddress = truncMiddle(address as string, 12);

  if (!address) {
    return <button onClick={() => disconnectAndLogout()}>Disconnect</button>;
  }

  // TODO consider summary like in nav example
  return (
    <div className="flex flex-row gap-2 justify-end items-center">
      {ensAvatar &&
        (
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={ensAvatar} alt="ens avatar" />
            </div>
          </div>
        )}
      <div className="dropdown dropdown-bottom dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-sm btn-outline  text-primary m-1"
        >
          <div>{ensName ? ensName : shortAddress}</div>
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-700 bg-pink rounded-box z-[1] w-52 p-2 shadow"
        >
          <li className="mb-4">
            <span>
              Contract address: <pre>{truncMiddle(proxyAddress, 12)}</pre>
            </span>
          </li>
          <li className="mb-4">
            <span>
              Chain ID: <pre>{JSON.stringify(chainId)}</pre>
            </span>
          </li>
          <li>
            <button onClick={() => disconnectAndLogout()}>Disconnect</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export const truncMiddle = (str: string, len: number) => {
  if (!str) {
    return "";
  }
  if (str.length <= len) {
    return str;
  }
  const half = len / 2;
  return `${str.slice(0, half)}...${str.slice(-half)}`;
};
