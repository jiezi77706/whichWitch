const hre = require("hardhat");

async function main() {
  console.log("🧪 测试 CyberGraphSync 合约...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("测试账户:", deployer.address);

  // 从环境变量获取合约地址
  const cyberGraphSyncAddress = process.env.CYBERGRAPH_SYNC_ADDRESS;
  
  if (!cyberGraphSyncAddress) {
    console.error("❌ 请设置 CYBERGRAPH_SYNC_ADDRESS 环境变量");
    process.exit(1);
  }

  try {
    // 连接到已部署的合约
    const cyberGraphSync = await hre.ethers.getContractAt("CyberGraphSync", cyberGraphSyncAddress);
    
    console.log("=".repeat(50));
    console.log("📋 合约信息:");
    console.log("=".repeat(50));
    
    // 读取合约配置
    const creationManager = await cyberGraphSync.creationManager();
    const cyberGraphRelay = await cyberGraphSync.cyberGraphRelay();
    const owner = await cyberGraphSync.owner();
    const syncFee = await cyberGraphSync.syncFee();
    const nextSyncId = await cyberGraphSync.nextSyncId();

    console.log("合约地址:", cyberGraphSyncAddress);
    console.log("CreationManager:", creationManager);
    console.log("CyberGraph Relay:", cyberGraphRelay);
    console.log("Owner:", owner);
    console.log("Sync Fee:", hre.ethers.formatEther(syncFee), "ETH");
    console.log("Next Sync ID:", nextSyncId.toString());
    console.log();

    // 测试创作者档案更新
    console.log("=".repeat(50));
    console.log("🧪 测试创作者档案更新...");
    console.log("=".repeat(50));
    
    const profileTx = await cyberGraphSync.updateCreatorProfile(
      "test_creator_" + Date.now(),
      JSON.stringify({
        bio: "Test creator profile",
        avatar: "https://example.com/avatar.jpg",
        website: "https://example.com"
      })
    );
    
    await profileTx.wait();
    console.log("✅ 档案更新成功, 交易:", profileTx.hash);

    // 读取创作者档案
    const profile = await cyberGraphSync.creatorProfiles(deployer.address);
    console.log("📋 创作者档案:");
    console.log("  - 地址:", profile.creatorAddress);
    console.log("  - CyberGraph 用户名:", profile.cyberGraphHandle);
    console.log("  - 关注者数量:", profile.followersCount.toString());
    console.log("  - 关注数量:", profile.followingCount.toString());
    console.log("  - 作品数量:", profile.worksCount.toString());
    console.log("  - 已验证:", profile.isVerified);
    console.log();

    // 测试查询功能
    console.log("=".repeat(50));
    console.log("🔍 测试查询功能...");
    console.log("=".repeat(50));
    
    const socialGraph = await cyberGraphSync.getCreatorSocialGraph(deployer.address);
    console.log("📊 社交图谱数据:");
    console.log("  - 关注者:", socialGraph[0].length);
    console.log("  - 关注中:", socialGraph[1].length);
    console.log("  - 同步记录:", socialGraph[2].length);
    console.log();

    console.log("✅ 所有测试通过!");

  } catch (error) {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });