import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "../",
      deployments: {
        Lock: {
          31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        },
      },
    }),
    react(),
  ],
});
