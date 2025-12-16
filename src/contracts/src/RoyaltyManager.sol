// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RoyaltyManager
 * @notice 版税分配逻辑合约
 * @dev 处理NFT销售和二创授权的版税分配，确保每个中间创作者都有利润可分
 */
contract RoyaltyManager is ReentrancyGuard {
    // Custom errors
    error ZeroAmount();
    error InvalidCreationManager();
    error UnauthorizedCaller();
    error InsufficientBalance(address user, uint256 balance);
    error WithdrawalFailed(address recipient);

    // State variables
    mapping(address => uint256) public balances;
    address public creationManager;
    address public paymentManager; // 原有的PaymentManager，用于授权费分配
    address public platformWallet;

    // 版税分配配置 (basis points, 10000 = 100%)
    uint256 public constant PERCENTAGE_BASE = 10000;

    // 授权费分配（保持与原PaymentManager一致）
    uint256 public constant AUTH_DIRECT_CREATOR_SHARE = 4000;  // 40%
    uint256 public constant AUTH_ORIGINAL_CREATOR_SHARE = 4000; // 40%
    uint256 public constant AUTH_MIDDLE_ANCESTORS_POOL = 2000;  // 20%

    // Events
    event AuthorizationRoyaltyDistributed(
        uint256 indexed workId,
        address[] recipients,
        uint256[] amounts,
        uint256 totalAmount,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    event CreationManagerSet(address indexed creationManager);
    event PaymentManagerSet(address indexed paymentManager);

    /**
     * @notice Constructor
     * @param _creationManager CreationManager合约地址
     * @param _platformWallet 平台钱包地址
     */
    constructor(address _creationManager, address _platformWallet) {
        if (_creationManager == address(0)) revert InvalidCreationManager();
        require(_platformWallet != address(0), "Invalid platform wallet");

        creationManager = _creationManager;
        platformWallet = _platformWallet;
    }

    /**
     * @notice 设置PaymentManager合约地址
     * @param _paymentManager PaymentManager合约地址
     */
    function setPaymentManager(address _paymentManager) external {
        require(paymentManager == address(0), "Already set");
        require(_paymentManager != address(0), "Invalid payment manager");
        paymentManager = _paymentManager;
        emit PaymentManagerSet(_paymentManager);
    }





    /**
     * @notice 分配授权费版税（兼容原PaymentManager逻辑）
     * @param workId 作品ID
     * @param directCreator 直接创作者地址
     * @param ancestors 祖先创作者地址数组
     * @dev 只能由PaymentManager调用
     * 分配规则：40%给直接创作者，40%给原创作者，20%给中间创作者
     * 注意：授权费和打赏存储在合约中，统一提现时收取3.5%手续费
     */
    function distributeAuthorizationRoyalty(
        uint256 workId,
        address directCreator,
        address[] calldata ancestors
    ) external payable nonReentrant {
        if (msg.sender != paymentManager) revert UnauthorizedCaller();
        if (msg.value == 0) revert ZeroAmount();

        // 直接创作者获得40%
        uint256 directShare = (msg.value * AUTH_DIRECT_CREATOR_SHARE) / PERCENTAGE_BASE;
        balances[directCreator] += directShare;

        // 准备事件数据
        address[] memory recipients = new address[](ancestors.length + 1);
        uint256[] memory amounts = new uint256[](ancestors.length + 1);
        
        recipients[0] = directCreator;
        amounts[0] = directShare;

        // 分配给祖先
        if (ancestors.length == 0) {
            // 没有祖先：只有直接创作者
            emit AuthorizationRoyaltyDistributed(workId, recipients, amounts, msg.value, block.timestamp);
            return;
        }

        if (ancestors.length == 1) {
            // 只有原创作者：获得40% + 20% = 60%
            uint256 totalOriginalShare = ((msg.value * AUTH_ORIGINAL_CREATOR_SHARE) / PERCENTAGE_BASE) + 
                                        ((msg.value * AUTH_MIDDLE_ANCESTORS_POOL) / PERCENTAGE_BASE);
            balances[ancestors[0]] += totalOriginalShare;
            recipients[1] = ancestors[0];
            amounts[1] = totalOriginalShare;
        } else {
            // 多个祖先：原创作者获得40%，中间祖先分享20%
            uint256 originalShare = (msg.value * AUTH_ORIGINAL_CREATOR_SHARE) / PERCENTAGE_BASE;
            balances[ancestors[0]] += originalShare;
            recipients[1] = ancestors[0];
            amounts[1] = originalShare;

            // 中间祖先分享20%
            uint256 middlePool = (msg.value * AUTH_MIDDLE_ANCESTORS_POOL) / PERCENTAGE_BASE;
            uint256 perMiddle = middlePool / (ancestors.length - 1);

            for (uint256 i = 1; i < ancestors.length; i++) {
                uint256 share = perMiddle;
                if (i == 1) {
                    share += middlePool - (perMiddle * (ancestors.length - 1));
                }
                balances[ancestors[i]] += share;
                recipients[i + 1] = ancestors[i];
                amounts[i + 1] = share;
            }
        }

        emit AuthorizationRoyaltyDistributed(workId, recipients, amounts, msg.value, block.timestamp);
    }

    /**
     * @notice 获取用户余额
     * @param user 用户地址
     * @return 余额（wei）
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @notice 提取余额
     * @dev 用户提取自己的版税收入
     */
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert InsufficientBalance(msg.sender, 0);

        // 更新余额
        balances[msg.sender] = 0;

        // 转账
        (bool success,) = payable(msg.sender).call{value: amount}("");
        if (!success) revert WithdrawalFailed(msg.sender);

        emit Withdrawal(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice 批量提取多个用户的余额（紧急情况使用）
     * @param users 用户地址数组
     * @dev 只能由平台钱包调用，用于紧急情况
     */
    function emergencyWithdraw(address[] calldata users) external nonReentrant {
        require(msg.sender == platformWallet, "Only platform wallet");

        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 amount = balances[user];
            
            if (amount > 0) {
                balances[user] = 0;
                (bool success,) = payable(user).call{value: amount}("");
                if (success) {
                    emit Withdrawal(user, amount, block.timestamp);
                }
            }
        }
    }
}