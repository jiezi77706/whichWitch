// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title NFTMarketplace
 * @notice NFT交易市场合约，支持版税分润
 * @dev 处理NFT的上架、购买和版税分配
 */
contract NFTMarketplace is ReentrancyGuard {
    // Custom errors
    error NotTokenOwner(address caller, uint256 tokenId);
    error TokenNotApproved(uint256 tokenId);
    error ListingNotFound(uint256 tokenId);
    error ListingNotActive(uint256 tokenId);
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidPrice();
    error InvalidNFTManager();
    error InvalidRoyaltyManager();
    error TransferFailed();

    // Listing structure
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => Listing) public listings; // tokenId => Listing
    mapping(address => uint256[]) public sellerListings; // seller => tokenIds
    uint256[] public activeListings;

    address public nftManager;
    address public royaltyManager;
    address public platformWallet;
    
    // Platform fee (in basis points, 10000 = 100%)
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant PERCENTAGE_BASE = 10000;
    
    // NFT销售版税分配 (即时到账，不存储在合约中)
    uint256 public constant NFT_SELLER_SHARE = 7000;        // 70% 给卖家
    uint256 public constant NFT_ORIGINAL_CREATOR_SHARE = 2000; // 20% 给原创作者
    uint256 public constant NFT_MIDDLE_ANCESTORS_POOL = 1000;  // 10% 给中间创作者

    // Events
    event TokenListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 platformFee,
        uint256 timestamp
    );

    event NFTSaleRoyaltyDistributed(
        uint256 indexed workId,
        address indexed seller,
        address[] recipients,
        uint256[] amounts,
        uint256 totalAmount,
        uint256 timestamp
    );

    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 timestamp
    );

    event PlatformWalletSet(address indexed platformWallet);

    /**
     * @notice Constructor
     * @param _nftManager NFTManager合约地址
     * @param _royaltyManager RoyaltyManager合约地址
     * @param _platformWallet 平台钱包地址
     */
    constructor(
        address _nftManager,
        address _royaltyManager,
        address _platformWallet
    ) {
        if (_nftManager == address(0)) revert InvalidNFTManager();
        if (_royaltyManager == address(0)) revert InvalidRoyaltyManager();
        require(_platformWallet != address(0), "Invalid platform wallet");

        nftManager = _nftManager;
        royaltyManager = _royaltyManager;
        platformWallet = _platformWallet;
    }

    /**
     * @notice 上架NFT
     * @param tokenId NFT ID
     * @param price 售价（wei）
     */
    function listToken(uint256 tokenId, uint256 price) external nonReentrant {
        if (price == 0) revert InvalidPrice();

        IERC721 nft = IERC721(nftManager);
        
        // 检查所有权
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner(msg.sender, tokenId);
        }

        // 检查授权
        if (!nft.isApprovedForAll(msg.sender, address(this)) && 
            nft.getApproved(tokenId) != address(this)) {
            revert TokenNotApproved(tokenId);
        }

        // 创建listing
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            timestamp: block.timestamp
        });

        sellerListings[msg.sender].push(tokenId);
        activeListings.push(tokenId);

        emit TokenListed(tokenId, msg.sender, price, block.timestamp);
    }

    /**
     * @notice 购买NFT - 收入即时到账
     * @param tokenId NFT ID
     */
    function buyToken(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        
        if (listing.seller == address(0)) revert ListingNotFound(tokenId);
        if (!listing.active) revert ListingNotActive(tokenId);
        if (msg.value < listing.price) {
            revert InsufficientPayment(listing.price, msg.value);
        }

        address seller = listing.seller;
        uint256 price = listing.price;

        // 标记为非活跃
        listing.active = false;

        // 转移NFT
        IERC721(nftManager).safeTransferFrom(seller, msg.sender, tokenId);

        // 计算平台费用
        uint256 platformFee = (price * PLATFORM_FEE) / PERCENTAGE_BASE;
        uint256 remainingAmount = price - platformFee;

        // 获取作品ID和创作者链
        (bool success, bytes memory data) = nftManager.call(
            abi.encodeWithSignature("getTokenWork(uint256)", tokenId)
        );
        require(success, "Failed to get work ID");
        uint256 workId = abi.decode(data, (uint256));

        // 获取创作者链用于版税分配
        (bool chainSuccess, bytes memory chainData) = nftManager.call(
            abi.encodeWithSignature("getCreationManager()")
        );
        require(chainSuccess, "Failed to get creation manager");
        address creationManager = abi.decode(chainData, (address));

        (bool creatorsSuccess, bytes memory creatorsData) = creationManager.call(
            abi.encodeWithSignature("getCreatorChain(uint256)", workId)
        );
        require(creatorsSuccess, "Failed to get creator chain");
        address[] memory creatorChain = abi.decode(creatorsData, (address[]));

        // 即时分配版税 - 不存储在合约中
        _distributeNFTSaleRoyaltyInstant(workId, seller, creatorChain, remainingAmount);

        // 发送平台费用
        (bool platformSuccess,) = payable(platformWallet).call{value: platformFee}("");
        if (!platformSuccess) revert TransferFailed();

        // 退还多余的ETH
        if (msg.value > price) {
            (bool refundSuccess,) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }

        emit TokenSold(tokenId, seller, msg.sender, price, platformFee, block.timestamp);
    }

    /**
     * @notice 即时分配NFT销售版税
     * @param workId 作品ID
     * @param seller NFT卖家地址
     * @param creatorChain 创作者链
     * @param totalAmount 总分配金额
     * @dev 版税即时到账，不存储在合约中
     */
    function _distributeNFTSaleRoyaltyInstant(
        uint256 workId,
        address seller,
        address[] memory creatorChain,
        uint256 totalAmount
    ) internal {
        // 卖家获得70%
        uint256 sellerShare = (totalAmount * NFT_SELLER_SHARE) / PERCENTAGE_BASE;
        
        // 准备事件数据
        address[] memory recipients = new address[](creatorChain.length + 1);
        uint256[] memory amounts = new uint256[](creatorChain.length + 1);
        
        recipients[0] = seller;
        amounts[0] = sellerShare;

        // 即时转账给卖家
        (bool sellerSuccess,) = payable(seller).call{value: sellerShare}("");
        require(sellerSuccess, "Seller payment failed");

        if (creatorChain.length == 0) {
            // 没有创作者链，所有钱给卖家
            emit NFTSaleRoyaltyDistributed(workId, seller, recipients, amounts, totalAmount, block.timestamp);
            return;
        }

        if (creatorChain.length == 1) {
            // 只有原创作者：获得20% + 10% = 30%
            uint256 totalOriginalShare = ((totalAmount * NFT_ORIGINAL_CREATOR_SHARE) / PERCENTAGE_BASE) + 
                                        ((totalAmount * NFT_MIDDLE_ANCESTORS_POOL) / PERCENTAGE_BASE);
            recipients[1] = creatorChain[0];
            amounts[1] = totalOriginalShare;
            
            // 即时转账给原创作者
            (bool originalSuccess,) = payable(creatorChain[0]).call{value: totalOriginalShare}("");
            require(originalSuccess, "Original creator payment failed");
        } else {
            // 多个创作者：原创作者获得20%，中间创作者分享10%
            uint256 originalShare = (totalAmount * NFT_ORIGINAL_CREATOR_SHARE) / PERCENTAGE_BASE;
            recipients[1] = creatorChain[0];
            amounts[1] = originalShare;

            // 即时转账给原创作者
            (bool originalSuccess,) = payable(creatorChain[0]).call{value: originalShare}("");
            require(originalSuccess, "Original creator payment failed");

            // 中间创作者分享10%
            uint256 middlePool = (totalAmount * NFT_MIDDLE_ANCESTORS_POOL) / PERCENTAGE_BASE;
            uint256 middleCreators = creatorChain.length - 1;
            uint256 perMiddle = middlePool / middleCreators;

            for (uint256 i = 1; i < creatorChain.length; i++) {
                uint256 share = perMiddle;
                // 处理余数
                if (i == 1) {
                    share += middlePool - (perMiddle * middleCreators);
                }
                recipients[i + 1] = creatorChain[i];
                amounts[i + 1] = share;
                
                // 即时转账给中间创作者
                (bool middleSuccess,) = payable(creatorChain[i]).call{value: share}("");
                require(middleSuccess, "Middle creator payment failed");
            }
        }

        emit NFTSaleRoyaltyDistributed(workId, seller, recipients, amounts, totalAmount, block.timestamp);
    }

    /**
     * @notice 取消上架
     * @param tokenId NFT ID
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        
        if (listing.seller != msg.sender) {
            revert NotTokenOwner(msg.sender, tokenId);
        }
        if (!listing.active) revert ListingNotActive(tokenId);

        listing.active = false;

        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice 获取活跃的listing
     * @param tokenId NFT ID
     * @return listing Listing信息
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    /**
     * @notice 获取所有活跃的listings
     * @return tokenIds 活跃的NFT ID数组
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // 计算活跃listing数量
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (listings[activeListings[i]].active) {
                activeCount++;
            }
        }

        // 创建结果数组
        uint256[] memory result = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (listings[activeListings[i]].active) {
                result[index] = activeListings[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @notice 获取卖家的listings
     * @param seller 卖家地址
     * @return tokenIds NFT ID数组
     */
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    /**
     * @notice 更新平台钱包地址
     * @param _platformWallet 新的平台钱包地址
     */
    function setPlatformWallet(address _platformWallet) external {
        require(msg.sender == platformWallet, "Only platform wallet");
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        platformWallet = _platformWallet;
        emit PlatformWalletSet(_platformWallet);
    }
}