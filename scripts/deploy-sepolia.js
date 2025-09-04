// scripts/deploy-sepolia.js
const hre = require("hardhat");
require("dotenv").config();

/**
 * Despliega un contrato específico
 * @param {string} nombreContrato - nombre del contrato a desplegar
 * @param {Array} argumentos - parámetros del constructor
 * @param {string} cuentaDespliegue - cuenta para enviar transacción (opcional)
 * @return {Object} instancia del contrato desplegado
 */
async function desplegarContrato(nombreContrato, argumentos = [], cuentaDespliegue = null) {
  console.log(`🚀 Desplegando ${nombreContrato}...`);
  
  // Obtener cuentas disponibles
  const cuentas = await hre.ethers.getSigners();
  const deployer = cuentaDespliegue || cuentas[0];
  
  console.log(`📍 Desplegando desde cuenta: ${deployer.address}`);
  
  // Verificar balance
  const balance = await deployer.getBalance();
  console.log(`💰 Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.isZero()) {
    throw new Error("❌ La cuenta no tiene ETH para desplegar");
  }
  
  try {
    // Obtener factory del contrato
    const ContratoFactory = await hre.ethers.getContractFactory(nombreContrato);
    
    // Desplegar contrato
    const contratoInstancia = await ContratoFactory.deploy(...argumentos);
    
    // Esperar confirmación
    await contratoInstancia.deployed();
    
    console.log(`✅ ${nombreContrato} desplegado en: ${contratoInstancia.address}`);
    console.log(`🔗 Ver en Etherscan: https://sepolia.etherscan.io/address/${contratoInstancia.address}`);
    
    return {
      address: contratoInstancia.address,
      contract: contratoInstancia,
      deployer: deployer.address,
      transactionHash: contratoInstancia.deployTransaction.hash
    };
    
  } catch (error) {
    console.error(`❌ Error desplegando ${nombreContrato}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("🌐 Iniciando despliegue en Sepolia testnet...");
  console.log(`📡 Red: ${hre.network.name}`);
  
  try {
    // Desplegar Storage
    const resultadoStorage = await desplegarContrato("Storage");
    
    // Desplegar Owner  
    const resultadoOwner = await desplegarContrato("Owner");
    
    // Resumen final
    console.log("\n📋 RESUMEN DE DESPLIEGUE:");
    console.log("========================");
    console.log(`Storage: ${resultadoStorage.address}`);
    console.log(`Owner: ${resultadoOwner.address}`);
    console.log(`Deployer: ${resultadoStorage.deployer}`);
    console.log(`Red: ${hre.network.name}`);
    
    // Guardar direcciones en archivo para uso posterior
    const direcciones = {
      red: hre.network.name,
      storage: resultadoStorage.address,
      owner: resultadoOwner.address,
      deployer: resultadoStorage.deployer,
      timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      `deployed-addresses-${hre.network.name}.json`, 
      JSON.stringify(direcciones, null, 2)
    );
    
    console.log(`💾 Direcciones guardadas en: deployed-addresses-${hre.network.name}.json`);
    
    // Esperar antes de verificar
    if (hre.network.name === 'sepolia') {
      console.log("\n⏳ Esperando 60 segundos antes de verificar contratos...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      await verificarContratos(resultadoStorage.address, resultadoOwner.address);
    }
    
  } catch (error) {
    console.error("❌ Error en despliegue principal:", error);
    process.exit(1);
  }
}

async function verificarContratos(addressStorage, addressOwner) {
  console.log("\n🔍 Iniciando verificación de contratos...");
  
  try {
    // Verificar Storage
    await hre.run("verify:verify", {
      address: addressStorage,
      constructorArguments: []
    });
    console.log("✅ Storage verificado");
    
    // Verificar Owner
    await hre.run("verify:verify", {
      address: addressOwner, 
      constructorArguments: []
    });
    console.log("✅ Owner verificado");
    
  } catch (error) {
    console.log("⚠️ Error en verificación automática:", error.message);
    console.log(`🔧 Verifica manualmente:`);
    console.log(`npx hardhat verify --network sepolia ${addressStorage}`);
    console.log(`npx hardhat verify --network sepolia ${addressOwner}`);
  }
}

// Ejecutar script principal
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });