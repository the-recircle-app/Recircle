import { expect } from "chai";
import { ethers } from "hardhat";
import { EcoEarn } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EcoEarn", function () {
  let ecoEarn: EcoEarn;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const APP_ID = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const REWARDS_POOL = "0x1234567890123456789012345678901234567890";
  const B3TR_TOKEN = "0x1234567890123456789012345678901234567890";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const EcoEarn = await ethers.getContractFactory("EcoEarn");
    ecoEarn = await EcoEarn.deploy(APP_ID, REWARDS_POOL, B3TR_TOKEN);
    await ecoEarn.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct APP_ID", async function () {
      expect(await ecoEarn.APP_ID()).to.equal(APP_ID);
    });

    it("Should set the correct rewards pool", async function () {
      expect(await ecoEarn.VEBETTERDAO_REWARDS_POOL()).to.equal(REWARDS_POOL);
    });

    it("Should set the correct B3TR token address", async function () {
      expect(await ecoEarn.B3TR_TOKEN()).to.equal(B3TR_TOKEN);
    });

    it("Should set the deployer as owner", async function () {
      expect(await ecoEarn.owner()).to.equal(owner.address);
    });
  });

  describe("Reward Distribution", function () {
    it("Should distribute rewards for valid receipts", async function () {
      const receiptProof = {
        storeName: "Test Thrift Store",
        category: "clothing",
        amount: 2500,
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTestHash123",
        confidenceScore: 85
      };

      const rewardAmount = ethers.parseEther("5");

      await expect(
        ecoEarn.distributeReward(user1.address, 0, receiptProof, rewardAmount)
      )
        .to.emit(ecoEarn, "RewardDistributed");

      expect(await ecoEarn.totalEarned(user1.address)).to.equal(rewardAmount);
    });

    it("Should prevent duplicate receipt processing", async function () {
      const receiptProof = {
        storeName: "Test Store",
        category: "electronics",
        amount: 1000,
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmDuplicateHash",
        confidenceScore: 90
      };

      const rewardAmount = ethers.parseEther("3");

      await ecoEarn.distributeReward(user1.address, 0, receiptProof, rewardAmount);

      await expect(
        ecoEarn.distributeReward(user1.address, 0, receiptProof, rewardAmount)
      ).to.be.revertedWith("Receipt already processed");
    });
  });
});