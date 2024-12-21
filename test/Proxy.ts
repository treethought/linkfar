import { expect } from "chai";
import hre from "hardhat";

import ProxyModule from "../ignition/modules/ProxyModule";

describe("Proxy", function () {
  describe("Proxy interaction", async function () {
    it("Should be interactable via proxy", async function () {
      const [, otherAccount] = await hre.viem.getWalletClients();

      const { linkFar } = await hre.ignition.deploy(ProxyModule);

      const linkFarAsOtherAccount = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: otherAccount } },
      );
      expect(await linkFarAsOtherAccount.read.getVersion()).to.equal("0.0.1");
      expect(await linkFarAsOtherAccount.read.totalSupply()).to.equal(0n);
      expect(await linkFarAsOtherAccount.read.name()).to.equal("LinkFar");
      expect(await linkFarAsOtherAccount.read.contractURI()).to.equal(
        "ipfs://bafkreihw6snpq5f3qynocim47yuvpqq7xnlaptfisv6m3zsyhkdviwo6n4",
      );
    });
  });
});
