import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "../",
      deployments: {
        TransparentUpgradeableProxy: {
          31337: "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8",
          84532: "0x6367C37ABCb4726561E51c8eF1cE78A400badAdC",
          84533: "0x6367C37ABCb4726561E51c8eF1cE78A400badAdC",
        },
      },
    }),
    react(),
  ],
});
