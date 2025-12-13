const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 whichWitch 智能合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // 1. 部署 PaymentManager
  console.log("\n1️⃣ 部署 PaymentManager...");
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy();
  await paymentManager.deployed();
  console.log("✅ PaymentManager 部署到:", paymentManager.address);

  // 2. 部署 AuthorizationManager
  console.log("\n2️⃣ 部署 AuthorizationManager...");
  const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
  const authorizationManager = await AuthorizationManager.deploy();
  await authorizationManager.deployed();
  console.log("✅ AuthorizationManager 部署到:", authorizationManager.address);

  // 3. 部署 CreationManager
  console.log("\n3️⃣ 部署 CreationManager...");
  const CreationManager = await ethers.getContractFactory("CreationManager");
  const creationManager = await CreationManager.deploy(paymentManager.address);
  await creationManager.deployed();
  console.log("✅ CreationManager 部署到:", creationManager.address);

  // 4. 部署 NFTManager
  console.log("\n4️⃣ 部署 NFTManager...");
  const NFTManager = await ethers.getContractFactory("NFTManager");
  const nftManager = await NFTManager.deploy(
    "whichWitch NFT",
    "WITCH",
    deployer.address
  );
  await nftManager.deployed();
  console.log("✅ NFTManager 部署到:", nftManager.address);

  // 5. 部署 NFTMarketplace
  console.log("\n5️⃣ 部署 NFTMarketplace...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(
    deployer.address, // feeRecipient
    nftManager.address // nftManager
  );
  await nftMarketplace.deployed();
  console.log("✅ NFTMarketplace 部署到:", nftMarketplace.address);

  // 6. 设置合约之间的关联
  console.log("\n🔗 设置合约关联...");
  
  // 设置 CreationManager 的 AuthorizationManager
  await creationManager.setAuthorizationManager(authorizationManager.address);
  console.log("✅ CreationManager 已关联 AuthorizationManager");
  
  // 设置 CreationManager 的 NFTManager
  await creationManager.setNFTManager(nftManager.address);
  console.log("✅ CreationManager 已关联 NFTManager");
  
  // 设置 NFTManager 的 CreationManager
  await nftManager.setCreationManager(creationManager.address);
  console.log("✅ NFTManager 已关联 CreationManager");

  console.log("\n🎉 所有合约部署完成！");
  console.log("\n📋 合约地址汇总:");
  console.log("=" .repeat(50));
  console.log(`PaymentManager:        ${paymentManager.address}`);
  console.log(`AuthorizationManager:  ${authorizationManager.address}`);
  console.log(`CreationManager:       ${creationManager.address}`);
  console.log(`NFTManager:            ${nftManager.address}`);
  console.log(`NFTMarketplace:        ${nftMarketplace.address}`);
  console.log("=" .repeat(50));

  console.log("\n📝 请将以下环境变量添加到 .env 文件中:");
  console.log(`PAYMENT_MANAGER_ADDRESS=${paymentManager.address}`);
  console.log(`AUTHORIZATION_MANAGER_ADDRESS=${authorizationManager.address}`);
  console.log(`CREATION_MANAGER_ADDRESS=${creationManager.address}`);
  console.log(`NFT_MANAGER_ADDRESS=${nftManager.address}`);
  console.log(`MARKETPLACE_ADDRESS=${nftMarketplace.address}`);

  // 验证部署
  console.log("\n🔍 验证部署状态...");
  const creationManagerNFT = await creationManager.nftManager();
  const nftManagerCreation = await nftManager.creationManager();
  
  console.log("✅ CreationManager -> NFTManager:", creationManagerNFT === nftManager.address);
  console.log("✅ NFTManager -> CreationManager:", nftManagerCreation === creationManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });