const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 开始部署 CyberGraphSync 合约...");
  console.log("网络:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  try {
    // 从环境变量或配置中获取 CreationManager 地址
    const creationManagerAddress = process.env.CREATION_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000";
    
    if (creationManagerAddress === "0x0000000000000000000000000000000000000000") {
      console.error("❌ 请先设置 CREATION_MANAGER_ADDRESS 环境变量");
      console.log("如果还没有部署 CreationManager，请先运行:");
      console.log("npx hardhat run scripts/deploy.js --network <network>");
      process.exit(1);
    }

    console.log("CreationManager 地址:", creationManagerAddress);

    // CyberGraph 中继服务配置
    // 在实际部署中，这应该是一个专门的中继服务地址
    // 目前使用部署者地址作为临时中继服务
    const cyberGraphRelay = deployer.address;
    
    console.log("=".repeat(60));
    console.log("部署 CyberGraphSync...");
    console.log("=".repeat(60));
    console.log("CreationManager:", creationManagerAddress);
    console.log("CyberGraph Relay:", cyberGraphRelay);
    console.log("Initial Owner:", deployer.address);
    console.log();

    // 部署 CyberGraphSync 合约
    const CyberGraphSync = await hre.ethers.getContractFactory("CyberGraphSync");
    const cyberGraphSync = await CyberGraphSync.deploy(
      creationManagerAddress,  // _creationManager
      cyberGraphRelay,        // _cyberGraphRelay
      deployer.address        // initialOwner
    );

    await cyberGraphSync.waitForDeployment();
    const cyberGraphSyncAddress = await cyberGraphSync.getAddress();

    console.log("✅ CyberGraphSync 部署成功!");
    console.log("   地址:", cyberGraphSyncAddress);
    console.log();

    // 验证部署
    console.log("=".repeat(60));
    console.log("验证部署配置...");
    console.log("=".repeat(60));
    
    const deployedCreationManager = await cyberGraphSync.creationManager();
    const deployedCyberGraphRelay = await cyberGraphSync.cyberGraphRelay();
    const deployedOwner = await cyberGraphSync.owner();
    const syncFee = await cyberGraphSync.syncFee();

    console.log("✅ CreationManager:", deployedCreationManager);
    console.log("✅ CyberGraph Relay:", deployedCyberGraphRelay);
    console.log("✅ Owner:", deployedOwner);
    console.log("✅ Sync Fee:", hre.ethers.formatEther(syncFee), "ETH");
    console.log();

    // 保存部署信息
    const deploymentInfo = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contract: {
        name: "CyberGraphSync",
        address: cyberGraphSyncAddress,
        constructorArgs: [
          creationManagerAddress,
          cyberGraphRelay,
          deployer.address
        ],
        configuration: {
          creationManager: deployedCreationManager,
          cyberGraphRelay: deployedCyberGraphRelay,
          owner: deployedOwner,
          syncFee: syncFee.toString()
        }
      }
    };

    const filename = `deployment-cybergraph-${hre.network.name}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log("📝 部署信息已保存到:", filename);
    console.log();

    // 输出环境变量配置
    console.log("=".repeat(60));
    console.log("环境变量配置:");
    console.log("=".repeat(60));
    console.log("# 添加到 .env 文件");
    console.log(`CYBERGRAPH_SYNC_ADDRESS=${cyberGraphSyncAddress}`);
    console.log(`CYBERGRAPH_RELAY_ADDRESS=${cyberGraphRelay}`);
    console.log();
    console.log("# 前端环境变量 (.env.local)");
    console.log(`NEXT_PUBLIC_CYBERGRAPH_SYNC_ADDRESS=${cyberGraphSyncAddress}`);
    console.log("=".repeat(60));

    // 使用说明
    console.log();
    console.log("=".repeat(60));
    console.log("📋 使用说明:");
    console.log("=".repeat(60));
    console.log("1. CyberGraph Relay 服务配置:");
    console.log("   - 当前使用部署者地址作为临时中继服务");
    console.log("   - 生产环境需要部署专门的中继服务");
    console.log("   - 使用 setCyberGraphRelay() 更新中继服务地址");
    console.log();
    console.log("2. 同步费用配置:");
    console.log("   - 默认同步费用: 0.001 ETH");
    console.log("   - 使用 setSyncFee() 调整费用");
    console.log();
    console.log("3. 主要功能:");
    console.log("   - syncWorkToCyberGraph(): 同步作品到 CyberGraph");
    console.log("   - updateCreatorProfile(): 更新创作者档案");
    console.log("   - createSocialRelation(): 创建社交关系");
    console.log("   - batchSyncWorks(): 批量同步作品");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ 部署失败:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署脚本执行失败:");
    console.error(error);
    process.exit(1);
  });