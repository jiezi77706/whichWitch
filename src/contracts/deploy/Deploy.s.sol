// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CreationManager.sol";
import "../src/PaymentManager.sol";
import "../src/AuthorizationManager.sol";
import "../src/NFTManager.sol";
import "../src/RoyaltyManager.sol";
import "../src/NFTMarketplace.sol";

/**
 * @title Deploy
 * @notice Foundry 部署脚本
 * @dev 使用方法: forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
 */
contract Deploy is Script {
    // 部署的合约实例
    CreationManager public creationManager;
    PaymentManager public paymentManager;
    AuthorizationManager public authorizationManager;
    NFTManager public nftManager;
    RoyaltyManager public royaltyManager;
    NFTMarketplace public nftMarketplace;

    // 配置参数
    address public platformWallet;

    function setUp() public {
        // 从环境变量获取平台钱包地址，如果没有则使用部署者地址
        platformWallet = vm.envOr("PLATFORM_WALLET", msg.sender);
    }

    function run() public {
        // 开始广播交易
        vm.startBroadcast();

        console.log("开始部署 WhichWitch 合约系统...");
        console.log("部署者地址:", msg.sender);
        console.log("平台钱包地址:", platformWallet);

        // === 第一步: 部署基础合约 ===
        console.log("\n=== 第一步: 部署基础合约 ===");

        // 1. 部署 PaymentManager
        paymentManager = new PaymentManager(platformWallet);
        console.log("PaymentManager 部署到:", address(paymentManager));

        // 2. 部署 CreationManager
        creationManager = new CreationManager(address(paymentManager));
        console.log("CreationManager 部署到:", address(creationManager));

        // 3. 部署 AuthorizationManager
        authorizationManager = new AuthorizationManager(
            address(creationManager),
            address(paymentManager)
        );
        console.log("AuthorizationManager 部署到:", address(authorizationManager));

        // === 第二步: 部署NFT相关合约 ===
        console.log("\n=== 第二步: 部署NFT相关合约 ===");

        // 4. 部署 NFTManager
        nftManager = new NFTManager("WhichWitch NFT", "WITCH");
        console.log("NFTManager 部署到:", address(nftManager));

        // 5. 部署 RoyaltyManager
        royaltyManager = new RoyaltyManager(
            address(creationManager),
            platformWallet
        );
        console.log("RoyaltyManager 部署到:", address(royaltyManager));

        // 6. 部署 NFTMarketplace
        nftMarketplace = new NFTMarketplace(
            address(nftManager),
            address(royaltyManager),
            platformWallet
        );
        console.log("NFTMarketplace 部署到:", address(nftMarketplace));

        // === 第三步: 配置合约关系 ===
        console.log("\n=== 第三步: 配置合约关系 ===");

        // 配置 CreationManager
        console.log("配置 CreationManager...");
        creationManager.setAuthorizationManager(address(authorizationManager));
        console.log("✅ CreationManager.setAuthorizationManager 完成");
        
        creationManager.setNFTManager(address(nftManager));
        console.log("✅ CreationManager.setNFTManager 完成");

        // 配置 PaymentManager
        console.log("配置 PaymentManager...");
        paymentManager.setAuthorizationManager(address(authorizationManager));
        console.log("✅ PaymentManager.setAuthorizationManager 完成");
        
        paymentManager.setRoyaltyManager(address(royaltyManager));
        console.log("✅ PaymentManager.setRoyaltyManager 完成");

        // 配置 NFTManager
        console.log("配置 NFTManager...");
        nftManager.setCreationManager(address(creationManager));
        console.log("✅ NFTManager.setCreationManager 完成");
        
        nftManager.setRoyaltyManager(address(royaltyManager));
        console.log("✅ NFTManager.setRoyaltyManager 完成");

        // 配置 RoyaltyManager
        console.log("配置 RoyaltyManager...");
        royaltyManager.setPaymentManager(address(paymentManager));
        console.log("✅ RoyaltyManager.setPaymentManager 完成");

        // 停止广播
        vm.stopBroadcast();

        // === 输出部署结果 ===
        console.log("\n=== 部署完成 ===");
        _logDeployedAddresses();

        // === 验证部署 ===
        console.log("\n=== 验证部署 ===");
        _verifyDeployment();
    }

    function _logDeployedAddresses() internal view {
        console.log("所有合约地址:");
        console.log("CreationManager:", address(creationManager));
        console.log("PaymentManager:", address(paymentManager));
        console.log("AuthorizationManager:", address(authorizationManager));
        console.log("NFTManager:", address(nftManager));
        console.log("RoyaltyManager:", address(royaltyManager));
        console.log("NFTMarketplace:", address(nftMarketplace));
        console.log("平台钱包:", platformWallet);
    }

    function _verifyDeployment() internal view {
        // 验证 CreationManager 配置
        try {
            address authManager = creationManager.authorizationManager();
            address nftManagerAddr = creationManager.nftManager();
            console.log("✅ CreationManager 配置验证通过");
            console.log("  - AuthorizationManager:", authManager);
            console.log("  - NFTManager:", nftManagerAddr);
        } catch {
            console.log("❌ CreationManager 配置验证失败");
        }

        // 验证 PaymentManager 配置
        try {
            address royaltyManagerAddr = paymentManager.royaltyManager();
            console.log("✅ PaymentManager 配置验证通过");
            console.log("  - RoyaltyManager:", royaltyManagerAddr);
        } catch {
            console.log("❌ PaymentManager 配置验证失败");
        }

        // 验证 NFTManager 配置
        try {
            address creationManagerAddr = nftManager.creationManager();
            address royaltyManagerAddr = nftManager.royaltyManager();
            console.log("✅ NFTManager 配置验证通过");
            console.log("  - CreationManager:", creationManagerAddr);
            console.log("  - RoyaltyManager:", royaltyManagerAddr);
        } catch {
            console.log("❌ NFTManager 配置验证失败");
        }
    }

    // 辅助函数：获取所有部署的合约地址
    function getDeployedAddresses() external view returns (
        address _creationManager,
        address _paymentManager,
        address _authorizationManager,
        address _nftManager,
        address _royaltyManager,
        address _nftMarketplace,
        address _platformWallet
    ) {
        return (
            address(creationManager),
            address(paymentManager),
            address(authorizationManager),
            address(nftManager),
            address(royaltyManager),
            address(nftMarketplace),
            platformWallet
        );
    }
}