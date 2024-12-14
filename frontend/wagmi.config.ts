import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "../",
      deployments: {
        LinkFar: {
          31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          84532: "0xa6E577163a4882D0b2f5a5a2C8865439f4162cE9",
        },
      },
    }),
    react(),
  ],
});
