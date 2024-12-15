"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, hardhat } from "wagmi/chains";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { http } from "viem";

const appUrl = process.env.NEXT_PUBLIC_URL;
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  loginMethods: ["wallet"],
  defaultChain: hardhat,
  supportedChains: [hardhat, baseSepolia],
  appearance: {
    theme: "dark",
    showWalletLoginFirst: true,
    walletChainType: "ethereum-only",
    logo: `${appUrl}/icon.png`,
  },
};

export const config = createConfig({
  chains: [hardhat, baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
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
