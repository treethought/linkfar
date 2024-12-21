import { expect } from "chai";
import hre from "hardhat";

import ProxyModule from "../ignition/modules/ProxyModule";

describe("Proxy", function() {
  describe("Proxy interaction", async function() {
    it("Should be interactable via proxy", async function() {
      const [, otherAccount] = await hre.viem.getWalletClients();

      const { linkFar } = await hre.ignition.deploy(ProxyModule);

      const linkFarAsOtherAccount = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: otherAccount } },
      );
      expect(await linkFarAsOtherAccount.read.getVersion()).to.equal("0.0.1");
      expect(await linkFarAsOtherAccount.read.totalSupply()).to.equal(0n);
    });
  });
});
