import { type HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ledger";

const DEPLOYER_LEDGER_ACCOUNT = vars.get("DEPLOYER_LEDGER_ACCOUNT", "");
const BASE_SEPOLIA_URL = vars.get("BASE_SEPOLIA_URL", "");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  etherscan: {
    apiKey: {
      baseSepolia: "AWSWMEZ3K6CCCXD3JYGP4T9YJMC1UZTCYE",
    },
  },
  networks: {
    "base-sepolia": {
      url: BASE_SEPOLIA_URL,
      ledgerAccounts: [
        DEPLOYER_LEDGER_ACCOUNT,
      ],
    },
  },
};

export default config;
