// scripts/network-info.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.getBalance();
  
  console.log("🌐 Red:", hre.network.name);
  console.log("📍 Cuenta:", deployer.address);
  console.log("💰 Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  console.log("🔗 Chain ID:", await deployer.getChainId());
}

main().catch(console.error);