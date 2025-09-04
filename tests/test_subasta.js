// scripts/deploy.js

async function main() {
    console.log("🚀 Iniciando deployment del contrato Subasta...\n");

    // Obtener las cuentas
    const [deployer] = await ethers.getSigners();
    console.log("📱 Deploying desde la cuenta:", deployer.address);
    console.log("💰 Balance de la cuenta:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Parámetros del constructor
    const descripcionArticulo = "Subasta de NFT Coleccionable - Obra de Arte Digital Única";
    const duracionHoras = 24; // 24 horas de duración

    console.log("📋 Parámetros de la subasta:");
    console.log("   📝 Descripción:", descripcionArticulo);
    console.log("   ⏰ Duración:", duracionHoras, "horas\n");

    // Obtener el factory del contrato
    console.log("🔨 Compilando contrato...");
    const Subasta = await ethers.getContractFactory("Subasta");
    
    // Desplegar el contrato
    console.log("📤 Desplegando contrato...");
    const subasta = await Subasta.deploy(descripcionArticulo, duracionHoras);
    
    // Esperar confirmación
    console.log("⏳ Esperando confirmación...");
    await subasta.deployed();
    
    console.log("\n✅ ¡Contrato desplegado exitosamente!");
    console.log("📍 Dirección del contrato:", subasta.address);
    console.log("🔗 Hash de transacción:", subasta.deployTransaction.hash);
    console.log("⛽ Gas utilizado:", subasta.deployTransaction.gasLimit.toString());

    // Verificar información del contrato
    console.log("\n📊 Verificando información del contrato...");
    const info = await subasta.obtenerInfoSubasta();
    console.log("   📝 Descripción del artículo:", info.descripcion);
    console.log("   ⏰ Tiempo restante:", info.tiempoRestante.toString(), "segundos");
    console.log("   🟢 Subasta activa:", info.activa);
    console.log("   👑 Propietario:", await subasta.propietario());

    console.log("\n🎯 URLs importantes:");
    console.log("🔗 Etherscan (Sepolia):", `https://sepolia.etherscan.io/address/${subasta.address}`);
    console.log("🔍 Para verificar:", `https://sepolia.etherscan.io/verifyContract?address=${subasta.address}`);

    console.log("\n📝 Información para README:");
    console.log("```");
    console.log("Contrato Subasta");
    console.log("Dirección:", subasta.address);
    console.log("Red: Sepolia Testnet");
    console.log("Hash de deployment:", subasta.deployTransaction.hash);
    console.log("```");

    console.log("\n🎉 ¡Deployment completado!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error durante el deployment:");
        console.error(error);
        process.exit(1);
    });