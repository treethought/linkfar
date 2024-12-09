// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const AccountModule = buildModule("AccountModule", (m) => {
  const account = m.contract("Account", [], {});

  return { account };
});

export default AccountModule;
