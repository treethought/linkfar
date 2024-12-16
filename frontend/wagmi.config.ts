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
          31337: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
          84532: "0xEAA8FabFcB5e1C1179705e780Efb796312a78100",
          84533: "0x3190efc72afe43D5a4d4571Df3bFC5B2789f363c",
        },
      },
    }),
    react(),
  ],
});
