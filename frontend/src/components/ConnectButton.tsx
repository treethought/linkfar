import { linkFarAddress } from "@/generated";
import { usePrivy} from "@privy-io/react-auth";
import * as React from "react";
import { useChainId } from "wagmi";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

function LoginButton() {
  const {
    ready,
    authenticated,
    connectWallet,
  } = usePrivy();

  const disableLogin = !ready || (ready && authenticated);

  return (
    <button
      className="btn btn-primary"
      disabled={disableLogin}
      onClick={() => connectWallet()}
    >
      Log in
    </button>
  );
}

export default function ConnectButton() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <AccountOptions />;
  }
  return <LoginButton />;
}

const contractAddress = (chainId: number) => {
  const c = chainId as keyof typeof linkFarAddress;
  return linkFarAddress[c];
};

export function AccountOptions() {
  const { logout } = usePrivy();
  const chainId = useChainId({});
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1 });

  const disconnectAndLogout = async () => {
    await logout();
    disconnect();
  };

  const shortAddress = truncMiddle(address as string, 12);

  if (!address) {
    return <button onClick={() => disconnectAndLogout()}>Disconnect</button>;
  }

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
              Contract address:{" "}
              <pre>{truncMiddle(contractAddress(chainId)!, 12)}</pre>
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
  if (str.length <= len) {
    return str;
  }
  const half = len / 2;
  return `${str.slice(0, half)}...${str.slice(-half)}`;
};
