// scripts/verificar-config.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando configuración de Sepolia...\n");
  
  // Verificar variables de entorno
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const etherscanKey = process.env.ETHERSCAN_API_KEY;
  
  if (!rpcUrl) {
    console.log("❌ SEPOLIA_RPC_URL no configurado");
    return;
  }
  console.log("✅ RPC URL configurado");
  
  if (!privateKey) {
    console.log("❌ PRIVATE_KEY no configurado");
    return;
  }
  console.log("✅ Private Key configurado");
  
  if (!etherscanKey) {
    console.log("⚠️  ETHERSCAN_API_KEY no configurado (verificación manual requerida)");
  } else {
    console.log("✅ Etherscan API Key configurado");
  }
  
  // Verificar conexión y balance
  try {
    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.getBalance();
    
    console.log("\n📊 INFORMACIÓN DE LA CUENTA:");
    console.log(`Dirección: ${deployer.address}`);
    console.log(`Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
    console.log(`Red: ${hre.network.name}`);
    console.log(`Chain ID: ${await deployer.getChainId()}`);
    
    if (balance.isZero()) {
      console.log("\n🚨 ATENCIÓN: La cuenta no tiene ETH");
      console.log("Obtén ETH de prueba en: https://sepoliafaucet.com/");
    }
    
  } catch (error) {
    console.error("❌ Error conectando a Sepolia:", error.message);
  }
}

main().catch(console.error);