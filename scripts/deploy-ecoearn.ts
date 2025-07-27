import { ethers } from "hardhat";
import { ContractTransactionResponse } from "ethers";

async function main() {
  console.log("Deploying EcoEarn contract to VeChain...");

  // Get the contract factory
  const EcoEarn = await ethers.getContractFactory("EcoEarn");

  // VeBetterDAO configuration
  const APP_ID = process.env.VEBETTERDAO_APP_ID || "0x0000000000000000000000000000000000000000000000000000000000000000";
  const REWARDS_POOL = process.env.VEBETTERDAO_REWARDS_POOL || "0x0000000000000000000000000000000000000000";
  const B3TR_TOKEN = process.env.B3TR_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

  console.log("Deployment parameters:");
  console.log("APP_ID:", APP_ID);
  console.log("REWARDS_POOL:", REWARDS_POOL);
  console.log("B3TR_TOKEN:", B3TR_TOKEN);

  // Deploy the contract
  const ecoEarn = await EcoEarn.deploy(APP_ID, REWARDS_POOL, B3TR_TOKEN);
  
  // Wait for deployment to complete
  await ecoEarn.waitForDeployment();
  
  const contractAddress = await ecoEarn.getAddress();
  console.log("EcoEarn deployed to:", contractAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const appId = await ecoEarn.APP_ID();
  const rewardsPool = await ecoEarn.VEBETTERDAO_REWARDS_POOL();
  const b3trToken = await ecoEarn.B3TR_TOKEN();
  
  console.log("Verified APP_ID:", appId);
  console.log("Verified REWARDS_POOL:", rewardsPool);
  console.log("Verified B3TR_TOKEN:", b3trToken);

  // Get platform stats
  const [totalRewards, totalReceipts, totalCO2] = await ecoEarn.getPlatformStats();
  console.log("Initial platform stats:");
  console.log("Total rewards distributed:", totalRewards.toString());
  console.log("Total receipts processed:", totalReceipts.toString());
  console.log("Total CO2 saved (grams):", totalCO2.toString());

  console.log("\nDeployment complete!");
  console.log("Contract address:", contractAddress);
  
  return {
    contractAddress,
    appId: appId.toString(),
    rewardsPool,
    b3trToken
  };
}

// Handle deployment
main()
  .then((deployment) => {
    console.log("Deployment successful:", deployment);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });