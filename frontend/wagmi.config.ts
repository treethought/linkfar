import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    hardhat({
      project: "../",
      deployments: {
        Registry: {
          31337: "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
        },
      },
    }),
    react(),
  ],
});
