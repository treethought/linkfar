import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { encodeFunctionData, getAddress, zeroAddress } from "viem";

describe("LinkFar", function () {
  async function deployLinkFarFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2] = await hre.viem.getWalletClients();
    // Deploy the implementation contract
    const impl = await hre.viem.deployContract("LinkFar", [], {});
    console.log("Implementation deployed to:", impl.address);

    const initializeData = encodeFunctionData({
      abi: [
        {
          type: "function",
          inputs: [],
          name: "initialize",
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "initialize",
      args: [],
    });

    // Deploy the proxy
    const proxy = await hre.viem.deployContract("TransparentUpgradeableProxy", [
      impl.address, // Implementation address
      owner.account.address, // Proxy admin address
      initializeData, // Initialize call
    ]);
    console.log("Proxy deployed to:", proxy.address);

    const linkFar = await hre.viem.getContractAt("LinkFar", proxy.address, {
      client: { wallet: account1 },
    });

    const publicClient = await hre.viem.getPublicClient();
    return {
      linkFar,
      owner,
      account1,
      account2,
      publicClient,
    };
  }

  async function deployLinkFarAndMintFixture() {
    //const [owner, account1, account2] = await hre.viem.getWalletClients();
    //// Deploy the implementation contract
    //const impl = await hre.viem.deployContract("LinkFar", [], {});
    //console.log("Implementation deployed to:", impl.address);
    //
    //const initializeData = encodeFunctionData({
    //  abi: [
    //    {
    //      type: "function",
    //      inputs: [],
    //      name: "initialize",
    //      outputs: [],
    //      stateMutability: "nonpayable",
    //    },
    //  ],
    //  functionName: "initialize",
    //  args: [],
    //});
    //
    //// Deploy the proxy
    //const proxy = await hre.viem.deployContract("TransparentUpgradeableProxy", [
    //  impl.address, // Implementation address
    //  owner.account.address, // Proxy admin address
    //  initializeData, // Initialize call
    //]);
    //
    //let contract = await hre.viem.getContractAt(
    //  "LinkFar",
    //  proxy.address,
    //  { client: { wallet: account1 } },
    //);
    //const publicClient = await hre.viem.getPublicClient();
    const { linkFar, account1, account2, publicClient } = await loadFixture(
      deployLinkFarFixture,
    );

    let hash = await linkFar.write.mint(["uri1"]);
    let receipt = await publicClient.waitForTransactionReceipt({ hash });
    expect(receipt.status).to.equal("success");
    expect(await linkFar.read.totalSupply()).to.equal(1n);
    expect(await linkFar.read.uri([1n])).to.equal("uri1");

    let profile = await linkFar.read.getProfile([account1.account.address]);
    expect(profile.uri).to.equal("uri1");
    expect(profile.owner).to.equal(getAddress(account1.account.address));
    expect(profile.slug).to.equal("");

    let events = await linkFar.getEvents.ProfileCreated();
    expect(events).to.have.lengthOf(1);
    expect(events[0].args.id).to.equal(1n);
    expect(events[0].args.uri).to.equal("uri1");
    expect(events[0].args.owner).to.equal(
      getAddress(account1.account.address),
    );

    //const linkFar = await hre.viem.getContractAt("LinkFar", proxy.address, {
    //  client: { wallet: account1 },
    //});
    expect(linkFar.read.getProfileBySlug(["slug1"])).to.be.rejectedWith(
      "Profile does not exist",
    );

    return {
      linkFar,
      profile,
      account1,
      account2,
      publicClient,
    };
  }

  describe("Create Profiles", function () {
    it("Should create a new profile", async function () {
      const { linkFar, account1 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      // get the withdrawal events in the latest block
      const events = await linkFar.getEvents.ProfileCreated();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.id).to.equal(1n);
      expect(events[0].args.uri).to.equal("uri1");
      expect(events[0].args.owner).to.equal(
        getAddress(account1.account.address),
      );

      expect(await linkFar.read.totalSupply()).to.equal(1n);
      expect(await linkFar.read.totalMinted()).to.equal(1n);
      expect(await linkFar.read.getIdByAddress([account1.account.address])).to
        .equal(1n);
      expect(await linkFar.read.uri([1n])).to.equal("uri1");
    });
    it("should revert when minting second profile", async function () {
      const { linkFar, account1, account2, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let asAccount1 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account1 } },
      );

      expect(asAccount1.write.mint(["uri2"])).to.be.rejectedWith(
        "Profile already exists",
      );

      expect(await asAccount1.read.totalSupply()).to.equal(1n);
      expect(await asAccount1.read.totalMinted()).to.equal(1n);

      let asAccount2 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );

      let hash = await asAccount2.write.mint(["newaccount"]);
      let receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      expect(receipt.status).to.equal("success");
      expect(await asAccount2.read.totalSupply()).to.equal(2n);
      expect(await asAccount2.read.totalMinted()).to.equal(2n);

      let newProfile = await asAccount2.read.getProfile([
        account2.account.address,
      ]);
      expect(newProfile.uri).to.equal("newaccount");
      expect(newProfile.owner).to.equal(getAddress(account2.account.address));
      expect(newProfile.slug).to.equal("");
      expect(await asAccount2.read.getIdByAddress([account2.account.address]))
        .to.equal(2n);

      expect(await asAccount2.read.uri([2n])).to.equal("newaccount");
    });
  });

  describe("Manage profile", function () {
    it("should reject updating profile when user does not have one ", async function () {
      const { linkFar } = await loadFixture(deployLinkFarFixture);
      expect(linkFar.write.updateProfile(["test"])).to.be.rejectedWith(
        "Profile does not exist",
      );
    });
    it("should reject updating profile when user is not the owner", async function () {
      const { linkFar, account1, account2 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let asAccount2 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );

      expect(asAccount2.write.updateProfile(["test"])).to.be.rejectedWith(
        "Only profile owner can update",
      );

      expect(await asAccount2.read.uri([1n])).to.equal("uri1");
      expect(await asAccount2.read.getProfile([account1.account.address])).to
        .deep
        .equal({
          uri: "uri1",
          owner: getAddress(account1.account.address),
          slug: "",
        });
    });

    it("should update user's profile", async function () {
      const { linkFar, account1, profile, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let hash = await linkFar.write.updateProfile(["newuri"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let updateEvents = await linkFar.getEvents.ProfileChanged();
      expect(updateEvents).to.have.lengthOf(1);
      expect(updateEvents[0].args.id).to.equal(1n);
      expect(updateEvents[0].args.uri).to.equal("newuri");
      console.log("event for updated profile");
      console.log(updateEvents[0]);

      let updatedProfile = await linkFar.read.getProfile([
        account1.account.address,
      ]);
      expect(updatedProfile.uri).to.equal("newuri");
      expect(updatedProfile.owner).to.equal(
        getAddress(account1.account.address),
      );
      expect(updatedProfile.owner).to.equal(profile.owner);
      expect(updatedProfile.slug).to.equal(profile.slug);

      let idUri = await linkFar.read.uri([1n]);
      expect(idUri).to.equal("newuri");

      let idByAddress = await linkFar.read.getIdByAddress([
        account1.account.address,
      ]);
      expect(idByAddress).to.equal(1n);
    });
  });

  describe("Manage slugs", function () {
    it("should reject setting slug when profile does not exist", async function () {
      const { linkFar } = await loadFixture(deployLinkFarFixture);
      expect(linkFar.write.setSlug(["test"])).to.be.rejectedWith(
        "Profile does not exist",
      );
    });
    it("should reject setting slug when user is not the owner", async function () {
      const { linkFar, account1, account2 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let asAccount2 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );

      expect(asAccount2.write.setSlug(["test"])).to.be.rejectedWith(
        "Only profile owner can set slug",
      );

      let profile = await asAccount2.read.getProfile([
        account1.account.address,
      ]);

      expect(profile).to.deep
        .equal({
          uri: "uri1",
          owner: getAddress(account1.account.address),
          slug: "",
        });
    });

    it("should fail to get non-existent slug", async function () {
      const { linkFar } = await loadFixture(deployLinkFarAndMintFixture);

      expect(linkFar.read.getProfileBySlug(["slug1"])).to.be.rejectedWith(
        "Profile does not exist",
      );
    });

    it("should update slug", async function () {
      const { linkFar, account1, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let hash = await linkFar.write.setSlug(["slug1"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let profileByAddress = await linkFar.read.getProfile([
        account1.account.address,
      ]);

      expect(profileByAddress).to.deep
        .equal({
          uri: "uri1",
          owner: getAddress(account1.account.address),
          slug: "slug1",
        });

      let bySlug = await linkFar.read.getProfileBySlug(["slug1"]);
      expect(bySlug).to.deep.equal(profileByAddress);
    });
    it("should reject setting slug when it is already set", async function () {
      const { linkFar, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let hash = await linkFar.write.setSlug(["slug1"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      expect(linkFar.write.setSlug(["slug1"])).to.be.rejectedWith(
        "Slug already taken",
      );
    });
    it("should clear slug when changing slug", async function () {
      const { linkFar, account1, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );
      let hash = await linkFar.write.setSlug(["slug1"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let bySlug = await linkFar.read.getProfileBySlug(["slug1"]);
      expect(bySlug.owner).to.equal(getAddress(account1.account.address));

      let hash2 = await linkFar.write.setSlug(["slug2"]);
      let receipt2 = await publicClient.waitForTransactionReceipt({
        hash: hash2,
      });
      expect(receipt2.status).to.equal("success");

      let bySlug2 = await linkFar.read.getProfileBySlug(["slug2"]);
      expect(bySlug2.owner).to.equal(getAddress(account1.account.address));
      expect(bySlug2.uri).to.equal("uri1");
      expect(bySlug2.slug).to.equal("slug2");

      let bySlug1 = await linkFar.read.getProfileBySlug(["slug1"]);
      expect(bySlug1).to.deep.equal({
        uri: "",
        owner: zeroAddress,
        slug: "",
      });
    });
  });

  describe("Burn profile", function () {
    it("should reject burning profile when profile does not exist", async function () {
      const { linkFar, account1 } = await loadFixture(deployLinkFarFixture);
      expect(
        linkFar.write.burn([account1.account.address, 2n, 1n]),
      ).to.be.rejectedWith("Profile does not exist");
    });
    it("should reject burning profile when user is not the owner", async function () {
      const { linkFar, account1, account2 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let asAccount2 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );

      expect(asAccount2.write.burn([account1.account.address, 1n, 1n])).to
        .be
        .rejectedWith("Not profile owner");

      let profile = await asAccount2.read.getProfile([
        account1.account.address,
      ]);

      expect(profile).to.deep
        .equal({
          uri: "uri1",
          owner: getAddress(account1.account.address),
          slug: "",
        });
    });
    it("should reject burning value more than 1 profile", async function () {
      const { linkFar, account1 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );
      expect(linkFar.write.burn([account1.account.address, 1n, 2n])).to.be
        .rejectedWith("Value cannot exceed 1");
    });

    it("should burn profile", async function () {
      const { linkFar, account1, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );
      let hash = await linkFar.write.burn([account1.account.address, 1n, 1n]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      // ensure cleanup
      let profile = await linkFar.read.getProfile([account1.account.address]);
      expect(profile).to.deep
        .equal({
          uri: "",
          owner: zeroAddress,
          slug: "",
        });

      let idByAddress = await linkFar.read.getIdByAddress([
        account1.account.address,
      ]);
      expect(idByAddress).to.equal(0n);

      expect(await linkFar.read.totalSupply()).to.equal(0n);
      expect(await linkFar.read.totalMinted()).to.equal(1n);
    });

    it("should make slug available after burning", async function () {
      const { linkFar, account1, account2, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );
      let hash = await linkFar.write.setSlug(["theslug"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let bySlug = await linkFar.read.getProfileBySlug(["theslug"]);
      expect(bySlug.owner).to.equal(getAddress(account1.account.address));

      // mint a new profile
      let asAccount2 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );

      hash = await asAccount2.write.mint(["newaccounturi"]);
      receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
      expect(receipt.status).to.equal("success");

      // check other profile can't take the slug
      expect(asAccount2.write.setSlug(["theslug"])).to.be.rejectedWith(
        "Slug already taken",
      );

      // burn the profile
      hash = await linkFar.write.burn([account1.account.address, 1n, 1n]);
      receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
      expect(receipt.status).to.equal("success");

      // check slug is available
      expect(await linkFar.read.getProfileBySlug(["theslug"])).to.be.deep.equal(
        {
          uri: "",
          owner: zeroAddress,
          slug: "",
        },
      );

      // check new profile can take the slug
      hash = await asAccount2.write.setSlug(["theslug"]);
      receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
      expect(receipt.status).to.equal("success");

      bySlug = await linkFar.read.getProfileBySlug(["theslug"]);
      expect(bySlug.owner).to.equal(getAddress(account2.account.address));

      expect(await linkFar.read.totalSupply()).to.equal(1n);
      expect(await linkFar.read.totalMinted()).to.equal(2n);
    });
  });

  describe("Transfer profile", function () {
    it("should refect bad transfer", async function () {
        const { linkFar, account1, account2 } = await loadFixture(
          deployLinkFarAndMintFixture,
        );
        expect(linkFar.write.safeBatchTransferFrom([
          account1.account.address,
          account2.account.address,
          1n,
          1n,
          "0x",
        ])).to.be.rejectedWith("bad transfer");
      },
    );
    it("should reject transfering profile when profile does not exist", async function () {
      const { linkFar, account1, account2 } = await loadFixture(
        deployLinkFarFixture,
      );
      expect(linkFar.write.safeTransferFrom([
        account2.account.address,
        account1.account.address,
        2n,
        1n,
        "0x",
      ])).to.be.rejectedWith("Profile does not exist");
    });
    it("should reject transfering profile when user is not the owner", async function () {
      const { linkFar, account1, account2 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let asAccount2 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account2 } },
      );
      expect(asAccount2.write.safeTransferFrom([
        account1.account.address,
        account2.account.address,
        1n,
        1n,
        "0x",
      ])).to.be.rejectedWith("Can only transfer from your own account");

      let profile = await asAccount2.read.getProfile([
        account1.account.address,
      ]);

      expect(profile).to.deep
        .equal({
          uri: "uri1",
          owner: getAddress(account1.account.address),
          slug: "",
        });
    });
    it("should reject transfering profile when value is more than 1", async function () {
      const { linkFar, account1, account2 } = await loadFixture(
        deployLinkFarAndMintFixture,
      );
      expect(linkFar.write.safeTransferFrom([
        account1.account.address,
        account2.account.address,
        1n,
        2n,
        "0x",
      ])).to.be.rejectedWith("Value cannot exceed 1");
    });
    it("should burn profile when transferring to zero address", async function () {
      const { linkFar, account1, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      // set slug
      let hash = await linkFar.write.setSlug(["slug1"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      // transfer to zero address
      hash = await linkFar.write.safeTransferFrom([
        account1.account.address,
        zeroAddress,
        1n,
        1n,
        "0x",
      ]);
      receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      // check for burn event
      let burnEvents = await linkFar.getEvents.ProfileBurned();
      expect(burnEvents).to.have.lengthOf(1);
      expect(burnEvents[0].args.id).to.equal(1n);
      expect(burnEvents[0].args.owner).to.equal(
        getAddress(account1.account.address),
      );

      // ensure cleanup
      let profile = await linkFar.read.getProfile([account1.account.address]);
      expect(profile).to.deep.equal({
        uri: "", // burned so uri should be empty
        owner: zeroAddress,
        slug: "", // slug should be cleared
      });

      let idByAddress = await linkFar.read.getIdByAddress([
        account1.account.address,
      ]);
      expect(idByAddress).to.equal(0n);

      // zero address should not have the profile with data
      let zeroProfile = await linkFar.read.getProfile([zeroAddress]);
      expect(zeroProfile).to.deep.equal({
        uri: "",
        owner: zeroAddress,
        slug: "",
      });

      let idByZeroAddress = await linkFar.read.getIdByAddress([zeroAddress]);
      expect(idByZeroAddress).to.equal(0n);

      // slug should no longer be taken
      let bySlug = await linkFar.read.getProfileBySlug(["slug1"]);
      expect(bySlug).to.deep.equal({
        uri: "",
        owner: zeroAddress,
        slug: "",
      });

      expect(await linkFar.read.totalSupply()).to.equal(0n);
      expect(await linkFar.read.totalMinted()).to.equal(1n);
    });
    it("should transfer profile", async function () {
      const { linkFar, account1, account2, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let asAccount1 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account1 } },
      );

      let hash = await asAccount1.write.safeTransferFrom([
        account1.account.address,
        account2.account.address,
        1n,
        1n,
        "0x",
      ]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      // ensure old mappings removed
      let profile1 = await linkFar.read.getProfile([
        account1.account.address,
      ]);
      expect(profile1).to.deep
        .equal({
          uri: "",
          owner: zeroAddress,
          slug: "",
        });

      let idByAddress1 = await linkFar.read.getIdByAddress([
        account1.account.address,
      ]);
      expect(idByAddress1).to.equal(0n);

      // ensure mappings are updated
      //
      let profile2 = await linkFar.read.getProfile([
        account2.account.address,
      ]);
      expect(profile2).to.deep
        .equal({
          uri: "uri1",
          owner: getAddress(account2.account.address),
          slug: "",
        });

      let idByAddress2 = await linkFar.read.getIdByAddress([
        account2.account.address,
      ]);
      expect(idByAddress2).to.equal(1n);

      expect(await linkFar.read.totalSupply()).to.equal(1n);
      expect(await linkFar.read.totalMinted()).to.equal(1n);
    });
    it("should transfer slug", async function () {
      const { linkFar, account1, account2, publicClient } = await loadFixture(
        deployLinkFarAndMintFixture,
      );

      let hash = await linkFar.write.setSlug(["slugToTransfer"]);
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let asAccount1 = await hre.viem.getContractAt(
        "LinkFar",
        linkFar.address,
        { client: { wallet: account1 } },
      );

      hash = await asAccount1.write.safeTransferFrom([
        account1.account.address,
        account2.account.address,
        1n,
        1n,
        "0x",
      ]);
      receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");

      let bySlug = await linkFar.read.getProfileBySlug(["slugToTransfer"]);
      expect(bySlug.owner).to.equal(getAddress(account2.account.address));
    });
  });
});
