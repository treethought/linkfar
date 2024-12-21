import { buildModule } from "@nomicfoundation/ignition-core";
import { proxyModule } from "./ProxyModule";

const upgradeModule = buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);
  console.log("proxyAdminOwner: ", proxyAdminOwner);

  const { proxyAdmin, proxy } = m.useModule(proxyModule);

  const linkFarV2 = m.contract("LinkFarV2", [], {});

  m.call(
    proxyAdmin,
    "upgradeAndCall",
    [proxy, linkFarV2, "0x"],
    {
      from: proxyAdminOwner,
    },
  );
  return { proxyAdmin, proxy };
});

const linkFarV2 = buildModule("linkFarV2Module", (m) => {
  const { proxy } = m.useModule(upgradeModule);

  const linkFarV2 = m.contractAt("LinkFarV2", proxy);

  return { linkFarV2 };
});

export default linkFarV2;
