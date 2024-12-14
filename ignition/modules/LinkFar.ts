// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LinkFarModule = buildModule("LinkFarModule", (m) => {
  const owner = m.getAccount(0);
  const linkFar = m.contract("LinkFar", [owner], {});

  return { linkFar };
});

export default LinkFarModule;
