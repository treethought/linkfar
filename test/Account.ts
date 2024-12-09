import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";
import { accountAbi } from "../frontend/src/generated";

describe("Account", function() {
  async function deployAccountFixture() {
    // Contracts are deployed using the first signer/account by default
    const [creator, owner] = await hre.viem.getWalletClients();

    const account = await hre.viem.deployContract("Account", [
      getAddress(owner.account.address),
      "",
    ], {});
    const publicClient = await hre.viem.getPublicClient();

    return {
      account,
      creator,
      owner,
      publicClient,
    };
  }

  describe("Deployment", function() {
    it("Should set the right owner", async function() {
      const { account, owner } = await loadFixture(deployAccountFixture);

      expect(await account.read.owner()).to.equal(
        getAddress(owner.account.address),
      );
    });
  });
  describe("Set URI", function() {
    it("Should fail to set the URI if not the owner", async function() {
      const { account, creator } = await loadFixture(deployAccountFixture);

      // retrieve the contract with a different account to send a transaction
      const accountAsCreator = await hre.viem.getContractAt(
        "Account",
        account.address,
        { client: { wallet: creator } },
      );

      const uri = "http://example.com";
      await expect(accountAsCreator.write.setUri([uri])).to.be
        .rejectedWith(
          "Not owner",
        );

      // check the new account contract was deployed with otherAccount as owner
      expect(await accountAsCreator.read.uri()).to.equal("");
    });

    it("Should set the URI", async function() {
      const { account, owner, publicClient } = await loadFixture(
        deployAccountFixture,
      );

      const accountAsOwner = await hre.viem.getContractAt(
        "Account",
        account.address,
        { client: { wallet: owner } },
      );

      let hash = await accountAsOwner.write.setUri(
        ["https://example.com"],
      );
      console.log("hash: ", hash);

      await publicClient.waitForTransactionReceipt({ hash });

      const events = await accountAsOwner.getEvents.UriSet();
      expect(events).to.have.lengthOf(1);

      const eventUri = events[0].args.uri;

      expect(eventUri).to.equal("https://example.com");

      // check the new account contract was deployed with otherAccount as owner
      expect(await accountAsOwner.read.uri()).to.equal(
        "https://example.com",
      );
    });
  });
});
