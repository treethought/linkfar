import { frameConnector } from "@/lib/connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base, hardhat, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [base, mainnet],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    // [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  connectors: [
    frameConnector(),
    //injected(),
    coinbaseWallet(),
    metaMask(),
  ],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
