import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("Registry", function() {
  async function deployRegistryFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const registry = await hre.viem.deployContract("Registry", [], {});

    const publicClient = await hre.viem.getPublicClient();

    return {
      registry,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function() {
    it("Should set the right owner", async function() {
      const { registry, owner } = await loadFixture(deployRegistryFixture);

      expect(await registry.read.owner()).to.equal(
        getAddress(owner.account.address),
      );
    });

    describe("Create Accounts", function() {
      it("Should create a new account", async function() {
        const { registry, otherAccount, publicClient } = await loadFixture(
          deployRegistryFixture,
        );

        // retrieve the contract with a different account to send a transaction
        console.log("getting registry as: ", otherAccount.account.address);
        const registryAsOtherAccount = await hre.viem.getContractAt(
          "Registry",
          registry.address,
          { client: { wallet: otherAccount } },
        );

        let hash = await registryAsOtherAccount.write.createAccount();
        console.log("hash: ", hash);

        await publicClient.waitForTransactionReceipt({ hash });

        // get the withdrawal events in the latest block
        const events = await registryAsOtherAccount.getEvents.AccountCreated();
        expect(events).to.have.lengthOf(1);
        console.log("events: ", events);

        // check the new account contract was deployed with otherAccount as owner

        let createdAccount = await hre.viem.getContractAt(
          "Account",
          events[0].args.account,
          { client: { wallet: otherAccount } },
        );

        expect(await createdAccount.read.owner()).to.equal(
          getAddress(otherAccount.account.address),
        );
      });
    });
  });
});
