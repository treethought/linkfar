"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base, baseSepolia, hardhat} from "wagmi/chains";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { http } from "viem";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const appUrl = process.env.NEXT_PUBLIC_URL;
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  externalWallets: {
    coinbaseWallet: {
      connectionOptions: "eoaOnly",
    },
  },
  loginMethods: ["wallet"],
  defaultChain: base,
  supportedChains: [base, baseSepolia],
  appearance: {
    theme: "dark",
    showWalletLoginFirst: true,
    walletChainType: "ethereum-only",
    logo: `${appUrl}/icon.svg`,
  },
};

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [farcasterFrame()], // wagmi connect is only done within rame
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_MAINNET_RPC,
    ),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC,
    ),
    [hardhat.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
