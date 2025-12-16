// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ZetaPaymentManager
 * @notice ZetaChain上的全链支付处理器
 * @dev 处理跨链支付，包括授权费支付和NFT购买
 */
contract ZetaPaymentManager is ReentrancyGuard {
    // Custom errors
    error ZeroAmount();
    error InvalidRecipient();
    error InvalidChainId();
    error PaymentFailed();
    error InsufficientBalance();
    error UnauthorizedCaller();

    // Payment types
    enum PaymentType {
        AUTHORIZATION_FEE,  // 授权费支付
        NFT_PURCHASE,       // NFT购买
        TIP                 // 打赏
    }

    // Cross-chain payment structure
    struct CrossChainPayment {
        uint256 paymentId;
        address sender;
        uint256 sourceChainId;
        uint256 targetChainId;
        address targetContract;
        uint256 amount;
        PaymentType paymentType;
        bytes paymentData; // 编码的支付参数
        bool processed;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => CrossChainPayment) public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(uint256 => bool) public supportedChains; // chainId => supported
    mapping(address => bool) public authorizedRelayers;
    
    uint256 public nextPaymentId = 1;
    address public owner;
    address public zetaConnector; // ZetaChain连接器地址
    
    // Supported chain IDs
    uint256 public constant BASE_CHAIN_ID = 8453;
    uint256 public constant ETHEREUM_CHAIN_ID = 1;
    uint256 public constant POLYGON_CHAIN_ID = 137;
    uint256 public constant BSC_CHAIN_ID = 56;

    // Events
    event CrossChainPaymentInitiated(
        uint256 indexed paymentId,
        address indexed sender,
        uint256 sourceChainId,
        uint256 targetChainId,
        address targetContract,
        uint256 amount,
        PaymentType paymentType,
        uint256 timestamp
    );

    event CrossChainPaymentProcessed(
        uint256 indexed paymentId,
        bool success,
        uint256 timestamp
    );

    event ChainSupportUpdated(
        uint256 indexed chainId,
        bool supported
    );

    event RelayerAuthorized(
        address indexed relayer,
        bool authorized
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorizedRelayer() {
        require(authorizedRelayers[msg.sender], "Only authorized relayer");
        _;
    }

    /**
     * @notice Constructor
     * @param _zetaConnector ZetaChain连接器地址
     */
    constructor(address _zetaConnector) {
        require(_zetaConnector != address(0), "Invalid zeta connector");
        
        owner = msg.sender;
        zetaConnector = _zetaConnector;
        
        // 初始化支持的链
        supportedChains[BASE_CHAIN_ID] = true;
        supportedChains[ETHEREUM_CHAIN_ID] = true;
        supportedChains[POLYGON_CHAIN_ID] = true;
        supportedChains[BSC_CHAIN_ID] = true;
    }

    /**
     * @notice 发起跨链授权费支付
     * @param targetChainId 目标链ID
     * @param targetContract 目标合约地址
     * @param workId 作品ID
     */
    function initiateAuthorizationPayment(
        uint256 targetChainId,
        address targetContract,
        uint256 workId
    ) external payable nonReentrant returns (uint256 paymentId) {
        if (msg.value == 0) revert ZeroAmount();
        if (targetContract == address(0)) revert InvalidRecipient();
        if (!supportedChains[targetChainId]) revert InvalidChainId();

        paymentId = nextPaymentId++;

        // 编码支付数据
        bytes memory paymentData = abi.encode(workId, msg.sender);

        payments[paymentId] = CrossChainPayment({
            paymentId: paymentId,
            sender: msg.sender,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            targetContract: targetContract,
            amount: msg.value,
            paymentType: PaymentType.AUTHORIZATION_FEE,
            paymentData: paymentData,
            processed: false,
            timestamp: block.timestamp
        });

        userPayments[msg.sender].push(paymentId);

        emit CrossChainPaymentInitiated(
            paymentId,
            msg.sender,
            block.chainid,
            targetChainId,
            targetContract,
            msg.value,
            PaymentType.AUTHORIZATION_FEE,
            block.timestamp
        );

        // 通过ZetaChain处理跨链支付
        _processZetaChainPayment(paymentId);
    }

    /**
     * @notice 发起跨链NFT购买支付
     * @param targetChainId 目标链ID
     * @param targetContract 目标合约地址（NFTMarketplace）
     * @param tokenId NFT ID
     * @dev 简化版本：仅处理跨链支付，具体NFT购买逻辑由目标链处理
     */
    function initiateNFTPurchasePayment(
        uint256 targetChainId,
        address targetContract,
        uint256 tokenId
    ) external payable nonReentrant returns (uint256 paymentId) {
        if (msg.value == 0) revert ZeroAmount();
        if (targetContract == address(0)) revert InvalidRecipient();
        if (!supportedChains[targetChainId]) revert InvalidChainId();

        paymentId = nextPaymentId++;

        // 编码支付数据
        bytes memory paymentData = abi.encode(tokenId, msg.sender);

        payments[paymentId] = CrossChainPayment({
            paymentId: paymentId,
            sender: msg.sender,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            targetContract: targetContract,
            amount: msg.value,
            paymentType: PaymentType.NFT_PURCHASE,
            paymentData: paymentData,
            processed: false,
            timestamp: block.timestamp
        });

        userPayments[msg.sender].push(paymentId);

        emit CrossChainPaymentInitiated(
            paymentId,
            msg.sender,
            block.chainid,
            targetChainId,
            targetContract,
            msg.value,
            PaymentType.NFT_PURCHASE,
            block.timestamp
        );

        // 通过ZetaChain处理跨链支付
        _processZetaChainPayment(paymentId);
    }

    /**
     * @notice 发起跨链打赏支付
     * @param targetChainId 目标链ID
     * @param targetContract 目标合约地址
     * @param recipient 接收者地址
     * @param workId 作品ID（可选）
     */
    function initiateTipPayment(
        uint256 targetChainId,
        address targetContract,
        address recipient,
        uint256 workId
    ) external payable nonReentrant returns (uint256 paymentId) {
        if (msg.value == 0) revert ZeroAmount();
        if (targetContract == address(0)) revert InvalidRecipient();
        if (recipient == address(0)) revert InvalidRecipient();
        if (!supportedChains[targetChainId]) revert InvalidChainId();

        paymentId = nextPaymentId++;

        // 编码支付数据
        bytes memory paymentData = abi.encode(recipient, workId);

        payments[paymentId] = CrossChainPayment({
            paymentId: paymentId,
            sender: msg.sender,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            targetContract: targetContract,
            amount: msg.value,
            paymentType: PaymentType.TIP,
            paymentData: paymentData,
            processed: false,
            timestamp: block.timestamp
        });

        userPayments[msg.sender].push(paymentId);

        emit CrossChainPaymentInitiated(
            paymentId,
            msg.sender,
            block.chainid,
            targetChainId,
            targetContract,
            msg.value,
            PaymentType.TIP,
            block.timestamp
        );

        // 通过ZetaChain处理跨链支付
        _processZetaChainPayment(paymentId);
    }

    /**
     * @notice 处理ZetaChain跨链支付
     * @param paymentId 支付ID
     * @dev 内部函数，通过ZetaChain连接器处理跨链消息
     */
    function _processZetaChainPayment(uint256 paymentId) internal {
        CrossChainPayment storage payment = payments[paymentId];
        
        // 构建跨链消息
        bytes memory message = abi.encode(
            payment.paymentId,
            payment.sender,
            payment.targetContract,
            payment.amount,
            payment.paymentType,
            payment.paymentData
        );

        // 通过ZetaChain连接器发送跨链消息
        (bool success,) = zetaConnector.call{value: payment.amount}(
            abi.encodeWithSignature(
                "sendCrossChainMessage(uint256,bytes)",
                payment.targetChainId,
                message
            )
        );

        if (!success) revert PaymentFailed();
    }

    /**
     * @notice 处理跨链支付确认
     * @param paymentId 支付ID
     * @param success 是否成功
     * @dev 只能由授权的中继器调用
     */
    function processPaymentConfirmation(uint256 paymentId, bool success) 
        external 
        onlyAuthorizedRelayer 
    {
        CrossChainPayment storage payment = payments[paymentId];
        require(!payment.processed, "Already processed");

        payment.processed = true;

        emit CrossChainPaymentProcessed(paymentId, success, block.timestamp);
    }

    /**
     * @notice 获取支付信息
     * @param paymentId 支付ID
     * @return payment 支付信息
     */
    function getPayment(uint256 paymentId) external view returns (CrossChainPayment memory) {
        return payments[paymentId];
    }

    /**
     * @notice 获取用户的支付记录
     * @param user 用户地址
     * @return paymentIds 支付ID数组
     */
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }

    /**
     * @notice 更新链支持状态
     * @param chainId 链ID
     * @param supported 是否支持
     */
    function updateChainSupport(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupportUpdated(chainId, supported);
    }

    /**
     * @notice 授权中继器
     * @param relayer 中继器地址
     * @param authorized 是否授权
     */
    function authorizeRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }

    /**
     * @notice 更新ZetaChain连接器地址
     * @param _zetaConnector 新的连接器地址
     */
    function updateZetaConnector(address _zetaConnector) external onlyOwner {
        require(_zetaConnector != address(0), "Invalid zeta connector");
        zetaConnector = _zetaConnector;
    }

    /**
     * @notice 紧急提取
     * @dev 只能由owner调用，用于紧急情况
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success,) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice 转移所有权
     * @param newOwner 新的所有者地址
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}