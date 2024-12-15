"use client";
import { frameConnector } from "@/lib/connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, createConfig, http, injected, WagmiProvider } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useEffect, useState } from "react";
import { useInFrame } from "@/hooks/frame";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

const appUrl = process.env.NEXT_PUBLIC_URL;

const ckConfig = getDefaultConfig({
  appName: "LinkFar",
  chains: [hardhat, baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
    [hardhat.id]: http(),
  },
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config>(createConfig(ckConfig));
  const { inFrame } = useInFrame();
  const [connectorUsed, setConnectorUsed] = useState(false);

  useEffect(() => {
    if (inFrame && !connectorUsed) {
      console.log("Using frame connector");
      setConnectorUsed(true);
      const cfg = createConfig({
        ...ckConfig,
        connectors: [
          frameConnector(),
          ...ckConfig.connectors ?? [],
        ],
      });
      setConfig(cfg);
    }
  }, [inFrame, connectorUsed]);

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
