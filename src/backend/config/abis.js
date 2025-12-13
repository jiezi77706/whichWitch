// 智能合约 ABI 配置 (CommonJS)

// CreationManager ABI
const CREATION_MANAGER_ABI = [
  "function createWork(string memory title, string memory description, string memory contentHash, uint256 price, bool isPublic) external returns (uint256)",
  "function getWork(uint256 workId) external view returns (uint256, address, uint256, uint256, uint256, bool, bool)",
  "function getUserWorks(address user) external view returns (uint256[] memory)",
  "function getWorkCount() external view returns (uint256)",
  "function updateWork(uint256 workId, string memory title, string memory description, uint256 price, bool isPublic) external",
  "function deleteWork(uint256 workId) external",
  "function purchaseWork(uint256 workId) external payable",
  "function setAuthorizationManager(address _authManager) external",
  "function setNFTManager(address _nftManager) external",
  "event WorkCreated(uint256 indexed workId, address indexed creator, string title, uint256 price)",
  "event WorkPurchased(uint256 indexed workId, address indexed buyer, uint256 price)",
  "event WorkUpdated(uint256 indexed workId, string title, uint256 price)"
];

// NFTManager ABI
const NFT_MANAGER_ABI = [
  "function mintNFT(address to, uint256 workId, string memory tokenURI) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external",
  "function getWorkTokens(uint256 workId) external view returns (uint256[] memory)",
  "function getTokenWork(uint256 tokenId) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

// NFTMarketplace ABI
const MARKETPLACE_ABI = [
  "function listNFT(uint256 tokenId, uint256 price) external",
  "function buyNFT(uint256 tokenId) external payable",
  "function cancelListing(uint256 tokenId) external",
  "function updatePrice(uint256 tokenId, uint256 newPrice) external",
  "function getListing(uint256 tokenId) external view returns (address, uint256, bool)",
  "function getActiveListings() external view returns (uint256[] memory)",
  "function getUserListings(address user) external view returns (uint256[] memory)",
  "function setFeePercentage(uint256 _feePercentage) external",
  "function withdraw() external",
  "event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event NFTSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price)",
  "event ListingCancelled(uint256 indexed tokenId, address indexed seller)",
  "event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice)"
];

// PaymentManager ABI
const PAYMENT_MANAGER_ABI = [
  "function processPayment(address buyer, address seller, uint256 amount, uint256 workId) external",
  "function getPlatformFee() external view returns (uint256)",
  "function setPlatformFee(uint256 _fee) external",
  "function withdraw() external",
  "function getBalance() external view returns (uint256)",
  "event PaymentProcessed(address indexed buyer, address indexed seller, uint256 amount, uint256 workId, uint256 fee)",
  "event PlatformFeeUpdated(uint256 oldFee, uint256 newFee)"
];

// AuthorizationManager ABI
const AUTHORIZATION_MANAGER_ABI = [
  "function grantPermission(address user, uint256 workId, uint8 permissionType) external",
  "function revokePermission(address user, uint256 workId, uint8 permissionType) external",
  "function hasPermission(address user, uint256 workId, uint8 permissionType) external view returns (bool)",
  "function getUserPermissions(address user) external view returns (uint256[] memory, uint8[] memory)",
  "function getWorkPermissions(uint256 workId) external view returns (address[] memory, uint8[] memory)",
  "event PermissionGranted(address indexed user, uint256 indexed workId, uint8 permissionType)",
  "event PermissionRevoked(address indexed user, uint256 indexed workId, uint8 permissionType)"
];

// ZetaChainBridge ABI
const ZETA_BRIDGE_ABI = [
  "function bridgeNFT(uint256 tokenId, uint256 destinationChainId) external payable",
  "function claimNFT(uint256 tokenId, address originalOwner, bytes32 txHash) external",
  "function getBridgeStatus(uint256 tokenId) external view returns (uint8, uint256, address)",
  "function setBridgeFee(uint256 _fee) external",
  "function withdraw() external",
  "event NFTBridged(uint256 indexed tokenId, address indexed owner, uint256 destinationChainId)",
  "event NFTClaimed(uint256 indexed tokenId, address indexed owner, bytes32 txHash)"
];

// 通用 ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string memory)",
  "function name() external view returns (string memory)"
];

// 导出所有 ABI
const ABIS = {
  CreationManager: CREATION_MANAGER_ABI,
  NFTManager: NFT_MANAGER_ABI,
  NFTMarketplace: MARKETPLACE_ABI,
  PaymentManager: PAYMENT_MANAGER_ABI,
  AuthorizationManager: AUTHORIZATION_MANAGER_ABI,
  ZetaChainBridge: ZETA_BRIDGE_ABI,
  ERC20: ERC20_ABI
};

module.exports = {
  CREATION_MANAGER_ABI,
  NFT_MANAGER_ABI,
  MARKETPLACE_ABI,
  PAYMENT_MANAGER_ABI,
  AUTHORIZATION_MANAGER_ABI,
  ZETA_BRIDGE_ABI,
  ERC20_ABI,
  ABIS
};