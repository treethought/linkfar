import { linkFarAddress } from "@/generated";
import * as React from "react";
import { Connector, useChainId, useConnect } from "wagmi";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export default function ConnectButton() {
  const { isConnected } = useAccount();
  if (isConnected) {
    return <AccountOptions />;
  }
  return <WalletOptions />;
}

const contractAddress = (chainId: number) => {
  const c = chainId as keyof typeof linkFarAddress;
  return linkFarAddress[c];
};

function WalletOptions() {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ));
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    console.log("connector effect", connector);
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <button
      className="btn btn-sm btn-outline text-primary"
      disabled={!ready}
      onClick={onClick}
    >
      {connector.name}
    </button>
  );
}

export function AccountOptions() {
  const chainId = useChainId({});
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const shortAddress = truncMiddle(address as string, 12);

  if (!address) {
    return <button onClick={() => disconnect()}>Disconnect</button>;
  }

  return (
    <div className="flex flex-row gap-2 justify-end items-center">
      {ensAvatar &&
        (
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={ensAvatar} alt="ens avatar" />
            </div>
          </div>
        )}
      <div className="dropdown dropdown-bottom dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-sm btn-outline text-primary m-1"
        >
          <div>{ensName ? `${ensName} (${shortAddress})` : shortAddress}</div>
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
            <button onClick={() => disconnect()}>Disconnect</button>
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
