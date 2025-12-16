# Changelog

All notable changes to the WhichWitch project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-16

### 🎉 Major Release: NFT Integration & Cross-Chain Support

### Added
- **NFT System**: Complete NFT integration for work ownership
  - `NFTManager.sol` - ERC721 contract for minting work ownership NFTs
  - `NFTMarketplace.sol` - Integrated marketplace for NFT trading
  - Instant royalty distribution for NFT sales
- **Cross-Chain Payment**: ZetaChain integration for multi-chain support
  - `ZetaPaymentManager.sol` - Cross-chain payment processor
  - Support for authorization fees and tips from any supported chain
- **Enhanced Royalty System**: 
  - `RoyaltyManager.sol` - Unified royalty distribution logic
  - Dual payment system: instant (NFT sales) vs stored (auth fees/tips)
- **Deployment Infrastructure**:
  - Complete deployment scripts for Hardhat and Foundry
  - Automated contract configuration and verification
  - Comprehensive deployment documentation

### Changed
- **Revenue Distribution Model**:
  - NFT Sales: 70% seller, 20% original creator, 10% middle ancestors (instant payout)
  - Authorization Fees: 40% direct, 40% original, 20% middle (stored in contract)
- **Platform Fees**:
  - NFT Trading: 2.5% (instant collection)
  - Withdrawal: 3.5% (reduced from 10%)
- **Contract Architecture**: Expanded from 3 to 6 specialized contracts
- **Payment Flow**: Hybrid instant/stored payment system

### Technical Improvements
- Enhanced security with ReentrancyGuard on all payment functions
- Gas-optimized contract interactions
- Comprehensive error handling with custom errors
- Event-driven architecture for better off-chain integration

### Documentation
- Updated README with v2.0 features and architecture
- Complete smart contract documentation
- Deployment guides and configuration examples
- API documentation for contract interactions

## [1.0.0] - 2024-11-XX

### 🚀 Initial Release: Core Creation Platform

### Added
- **Core Smart Contracts**:
  - `CreationManager.sol` - Work registration and relationship tracking
  - `AuthorizationManager.sol` - Permission and licensing system
  - `PaymentManager.sol` - Revenue distribution and withdrawal
- **Frontend Application**:
  - Next.js 14 application with modern React
  - MetaMask wallet integration
  - IPFS storage for work metadata
  - Supabase database integration
- **Core Features**:
  - Original work registration
  - Derivative work creation with authorization
  - Automatic revenue splitting across creator chain
  - Pull-based withdrawal system
- **Web3 Integration**:
  - Wagmi and Viem for blockchain interactions
  - Ethereum Sepolia testnet deployment
  - Gas-efficient contract design

### Infrastructure
- Vercel deployment pipeline
- Supabase PostgreSQL database
- IPFS storage via Pinata
- Comprehensive testing suite

---

## Development Guidelines

### Version Numbering
- **Major** (X.0.0): Breaking changes, major feature additions
- **Minor** (X.Y.0): New features, backward compatible
- **Patch** (X.Y.Z): Bug fixes, minor improvements

### Release Process
1. Update CHANGELOG.md with new version
2. Update package.json version
3. Create GitHub release with tag
4. Deploy to production
5. Update documentation

### Contributing
Please ensure all changes are documented in this changelog when submitting pull requests.