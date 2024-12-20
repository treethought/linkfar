import { type HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ledger";
import "@nomicfoundation/hardhat-verify";

const DEPLOYER_LEDGER_ACCOUNT = vars.get("DEPLOYER_LEDGER_ACCOUNT", "");
const BASE_SEPOLIA_URL = vars.get("BASE_SEPOLIA_URL", "");
const BASE_MAINNET_URL = vars.get("BASE_MAINNET_URL", "");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  etherscan: {
    apiKey: {
      "base-sepolia": "PLACEHOLDER_STRING",
      "base": vars.get("BASESCAN_API_KEY", ""),
    },
  },
  sourcify: {
    enabled: true,
  },
  networks: {
    "base-sepolia": {
      url: BASE_SEPOLIA_URL,
      ledgerAccounts: [
        DEPLOYER_LEDGER_ACCOUNT,
      ],
    },
    "base": {
      url: BASE_MAINNET_URL,
      ledgerAccounts: [
        DEPLOYER_LEDGER_ACCOUNT,
      ],
    },
  },
};

export default config;
