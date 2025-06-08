import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Deploying EcoEarn contract...");

  // Get the contract factory
  const EcoEarn = await ethers.getContractFactory("EcoEarn");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Mock VeBetterDAO configuration for testing
  const APP_ID = "0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1";
  const REWARDS_POOL = "0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38";
  const B3TR_TOKEN = "0x0dd62dac6abb12bd62a58469b34f4d986697ef19";

  console.log("Deployment parameters:");
  console.log("Admin:", deployer.address);
  console.log("APP_ID:", APP_ID);
  console.log("REWARDS_POOL:", REWARDS_POOL);
  console.log("B3TR_TOKEN:", B3TR_TOKEN);

  // Deploy the contract
  const ecoEarn = await EcoEarn.deploy(
    deployer.address, // admin
    APP_ID,
    REWARDS_POOL,
    B3TR_TOKEN
  );
  
  // Wait for deployment to complete
  await ecoEarn.waitForDeployment();
  
  const contractAddress = await ecoEarn.getAddress();
  console.log("EcoEarn deployed to:", contractAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const appId = await ecoEarn.appId();
  const b3trToken = await ecoEarn.B3TR_TOKEN();
  
  console.log("Verified APP_ID:", appId);
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