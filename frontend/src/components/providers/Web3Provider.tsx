"use client";
import { frameConnector } from "@/lib/connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const ckConfig = getDefaultConfig({
  appName: "LinkFar",
  chains: [hardhat, baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http(),
  },
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
});

export const config = createConfig({
  ...ckConfig,
  connectors: [
    frameConnector(),
    ...ckConfig.connectors ?? [],
  ],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          mode="dark"
          options={{ embedGoogleFonts: true }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
