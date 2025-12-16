// 部署脚本示例 (使用 Hardhat)
const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署 WhichWitch 合约系统...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);

    // 平台钱包地址 (可以是部署者或其他指定地址)
    const platformWallet = deployer.address; // 实际部署时应该使用专门的平台钱包地址

    console.log("\n=== 第一步: 部署基础合约 ===");

    // 1. 部署 PaymentManager (需要平台钱包地址)
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(platformWallet);
    await paymentManager.waitForDeployment();
    console.log("PaymentManager 部署到:", await paymentManager.getAddress());

    // 2. 部署 CreationManager (需要 PaymentManager 地址)
    const CreationManager = await ethers.getContractFactory("CreationManager");
    const creationManager = await CreationManager.deploy(await paymentManager.getAddress());
    await creationManager.waitForDeployment();
    console.log("CreationManager 部署到:", await creationManager.getAddress());

    // 3. 部署 AuthorizationManager (需要 CreationManager 和 PaymentManager 地址)
    const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
    const authorizationManager = await AuthorizationManager.deploy(
        await creationManager.getAddress(),
        await paymentManager.getAddress()
    );
    await authorizationManager.waitForDeployment();
    console.log("AuthorizationManager 部署到:", await authorizationManager.getAddress());

    console.log("\n=== 第二步: 部署NFT相关合约 ===");

    // 4. 部署 NFTManager
    const NFTManager = await ethers.getContractFactory("NFTManager");
    const nftManager = await NFTManager.deploy("WhichWitch NFT", "WITCH");
    await nftManager.waitForDeployment();
    console.log("NFTManager 部署到:", await nftManager.getAddress());

    // 5. 部署 RoyaltyManager (需要 CreationManager 和平台钱包地址)
    const RoyaltyManager = await ethers.getContractFactory("RoyaltyManager");
    const royaltyManager = await RoyaltyManager.deploy(
        await creationManager.getAddress(),
        platformWallet
    );
    await royaltyManager.waitForDeployment();
    console.log("RoyaltyManager 部署到:", await royaltyManager.getAddress());

    // 6. 部署 NFTMarketplace (需要 NFTManager, RoyaltyManager 和平台钱包地址)
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy(
        await nftManager.getAddress(),
        await royaltyManager.getAddress(),
        platformWallet
    );
    await nftMarketplace.waitForDeployment();
    console.log("NFTMarketplace 部署到:", await nftMarketplace.getAddress());

    console.log("\n=== 第三步: 配置合约关系 ===");

    // 配置 CreationManager
    console.log("配置 CreationManager...");
    await creationManager.setAuthorizationManager(await authorizationManager.getAddress());
    console.log("✅ CreationManager.setAuthorizationManager 完成");
    
    await creationManager.setNFTManager(await nftManager.getAddress());
    console.log("✅ CreationManager.setNFTManager 完成");

    // 配置 PaymentManager
    console.log("配置 PaymentManager...");
    await paymentManager.setAuthorizationManager(await authorizationManager.getAddress());
    console.log("✅ PaymentManager.setAuthorizationManager 完成");
    
    await paymentManager.setRoyaltyManager(await royaltyManager.getAddress());
    console.log("✅ PaymentManager.setRoyaltyManager 完成");

    // 配置 NFTManager
    console.log("配置 NFTManager...");
    await nftManager.setCreationManager(await creationManager.getAddress());
    console.log("✅ NFTManager.setCreationManager 完成");
    
    await nftManager.setRoyaltyManager(await royaltyManager.getAddress());
    console.log("✅ NFTManager.setRoyaltyManager 完成");

    // 配置 RoyaltyManager
    console.log("配置 RoyaltyManager...");
    await royaltyManager.setPaymentManager(await paymentManager.getAddress());
    console.log("✅ RoyaltyManager.setPaymentManager 完成");

    console.log("\n=== 部署完成 ===");
    console.log("所有合约地址:");
    console.log("CreationManager:", await creationManager.getAddress());
    console.log("PaymentManager:", await paymentManager.getAddress());
    console.log("AuthorizationManager:", await authorizationManager.getAddress());
    console.log("NFTManager:", await nftManager.getAddress());
    console.log("RoyaltyManager:", await royaltyManager.getAddress());
    console.log("NFTMarketplace:", await nftMarketplace.getAddress());
    console.log("平台钱包:", platformWallet);

    // 保存合约地址到文件
    const addresses = {
        network: await ethers.provider.getNetwork().then(n => n.name),
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        contracts: {
            CreationManager: await creationManager.getAddress(),
            PaymentManager: await paymentManager.getAddress(),
            AuthorizationManager: await authorizationManager.getAddress(),
            NFTManager: await nftManager.getAddress(),
            RoyaltyManager: await royaltyManager.getAddress(),
            NFTMarketplace: await nftMarketplace.getAddress()
        },
        platformWallet: platformWallet,
        deployedAt: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync(
        'deployed-addresses.json', 
        JSON.stringify(addresses, null, 2)
    );
    console.log("\n合约地址已保存到 deployed-addresses.json");

    console.log("\n=== 验证部署 ===");
    // 简单验证合约是否正确配置
    try {
        const authManager = await creationManager.authorizationManager();
        const nftManagerAddr = await creationManager.nftManager();
        console.log("✅ CreationManager 配置验证通过");
        console.log("  - AuthorizationManager:", authManager);
        console.log("  - NFTManager:", nftManagerAddr);
    } catch (error) {
        console.log("❌ CreationManager 配置验证失败:", error.message);
    }
}

// 错误处理
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });