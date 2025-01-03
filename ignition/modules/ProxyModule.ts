// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export const proxyModule = buildModule("ProxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const linkFar = m.contract("LinkFar", [], {});

  const initialize = m.encodeFunctionCall(linkFar, "initialize", []);

  const proxy = m.contract("TransparentUpgradeableProxy", [
    linkFar, // Implementation address
    proxyAdminOwner, // Proxy admin
    initialize, // Encoded initializer
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin",
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { proxyAdmin, proxy };
});

const LinkFarModule = buildModule("LinkFarModule", (m) => {
  const { proxyAdmin, proxy } = m.useModule(proxyModule);

  const linkFar = m.contractAt("LinkFar", proxy);
  return { linkFar, proxy, proxyAdmin };
});

export default LinkFarModule;
