import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("LinkFar", function () {
  async function deployLinkFarFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, account2] = await hre.viem.getWalletClients();

    const linkFar = await hre.viem.deployContract("LinkFar", [
      // owner.account.address,
    ], {});

    console.log("deployed to: ", linkFar.address);

    const publicClient = await hre.viem.getPublicClient();

    return {
      linkFar,
      owner,
      otherAccount,
      account2,
      publicClient,
    };
  }

  describe("Create Profiles", function () {
    it("Should create a new profile", async function () {
      const { linkFar, otherAccount, publicClient } = await loadFixture(
        deployLinkFarFixture,
      );

      // retrieve the contract with a different account to send a transaction
      console.log("getting LinkFar as: ", otherAccount.account.address);
      const linkFarAsOtherAccount = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: otherAccount } },
      );

      let hash = await linkFarAsOtherAccount.write.mint(["test"]);
      console.log("minted for account: ", otherAccount.account.address);

      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      // get the withdrawal events in the latest block
      const events = await linkFarAsOtherAccount.getEvents.ProfileCreated();
      expect(events).to.have.lengthOf(1);
      console.log("events: ", events);
      expect(events[0].args.id).to.equal(1n);
      expect(events[0].args.uri).to.equal("test");
      expect(events[0].args.owner).to.equal(
        getAddress(otherAccount.account.address),
      );

      //// check the new account contract was deployed with otherAccount as owner
      //
      let total = await linkFarAsOtherAccount.read.totalSupply();
      expect(total).to.equal(1n);

      let profile = await linkFarAsOtherAccount.read.getProfile(
        [otherAccount.account.address],
      );
      expect(profile.uri).to.equal("test");
      expect(profile.owner).to.equal(getAddress(otherAccount.account.address));

      // shoudl revert with profile already exists
      expect(linkFarAsOtherAccount.write.mint(["test"])).to.be.rejectedWith(
        "Profile already exists",
      );
    });
  });

  describe("Manage profile", function () {
    it("should reject updating profile when user does not have one ", async function () {
      const { linkFar } = await loadFixture(deployLinkFarFixture);
      expect(linkFar.write.updateProfile(["test"])).to.be.rejectedWith(
        "Profile does not exist",
      );
    });
    it("should update user's profile", async function () {
      const { linkFar, account2, otherAccount, publicClient } =
        await loadFixture(
          deployLinkFarFixture,
        );

      let contract = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );

      console.log("minting from account2: ", account2.account.address);

      let hash = await contract.write.mint(["uri1"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let events = await contract.getEvents.ProfileCreated();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.id).to.equal(1n);
      expect(events[0].args.uri).to.equal("uri1");
      expect(events[0].args.owner).to.equal(
        getAddress(account2.account.address),
      );
      console.log("event for minted profile");
      console.log(events[0]);

      let profile = await contract.read.getProfile([
        account2.account.address,
      ]);
      expect(profile.uri).to.equal("uri1");
      expect(profile.owner).to.equal(getAddress(account2.account.address));

      let idUri = await contract.read.uri([1n]);
      expect(idUri).to.equal("uri1");

      let updateHash = await expect(contract.write.updateProfile(["uri2"])).to
        .not.be.rejected;

      console.log("updateHash: ", updateHash);

      receipt = await publicClient.waitForTransactionReceipt({
        hash: updateHash,
      });
      expect(receipt.status).to.equal("success");

      let updateEvents = await contract.getEvents.ProfileChanged();
      expect(updateEvents).to.have.lengthOf(1);
      expect(updateEvents[0].args.id).to.equal(1n);
      expect(updateEvents[0].args.uri).to.equal("uri2");
      console.log("event for updated profile");
      console.log(updateEvents[0]);

      profile = await contract.read.getProfile([
        account2.account.address,
      ]);
      expect(profile.owner).to.equal(getAddress(account2.account.address));
      expect(profile.uri).to.equal("uri2");

      idUri = await contract.read.uri([1n]);
      expect(idUri).to.equal("uri2");

      let asOtherAccount = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: otherAccount } },
      );

      profile = await asOtherAccount.read.getProfile([
        account2.account.address,
      ]);
      expect(profile.uri).to.equal("uri2");
    });
  });
});
