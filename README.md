# WhichWitch

> *Let creation be a tree that can see its own growth.*

**🌐 Live App**: [https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/](https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/)  
*Fully deployed with smart contracts, database, MetaMask wallet integration, and IPFS storage. Try it now!*

**📊 Presentation**: [View on Canva](https://www.canva.com/design/DAG5t6aAKIU/JLK99jHgZNk_ge5mS-qDsQ/view?utm_content=DAG5t6aAKIU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3a5cb0fa9a)

---

## 🎯 Mission

Build an on-chain creation platform for **recording**, **incentivizing**, and **tracing** every creation. Enable automatic authorization and revenue sharing for original works, safeguarding creators' income and fostering continuous creation and sharing.

---

## ✨ Core Features

### 🔗 On-Chain Creation Tracking
- Register original works on blockchain
- Create derivative works with parent-child relationships
- Build transparent creation genealogy

### 🎨 NFT Work Ownership
- Mint NFTs representing work ownership rights
- Trade NFTs on integrated marketplace
- Instant royalty distribution to creator chain

### 💰 Dual Revenue System
- **NFT Sales**: Instant payouts (70% seller, 30% creator chain)
- **Authorization Fees**: Contract storage with 3.5% withdrawal fee
- **Cross-Chain Support**: Pay from any supported chain via ZetaChain

### 🎨 Enhanced Creator Workflow
1. **Upload** - Register original artwork on-chain
2. **Mint NFT** - Create ownership NFT (optional)
3. **List/Trade** - Sell NFT with automatic royalties
4. **Authorize** - Request permission for derivative creation
5. **Remix** - Create and register derivative works
6. **Earn** - Dual revenue streams (instant + stored)
7. **Withdraw** - Pull stored earnings anytime

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Blockchain**: Ethereum (Sepolia Testnet), Solidity
- **Web3**: Wagmi, Viem
- **Database**: Supabase (PostgreSQL)
- **Storage**: IPFS (Pinata)
- **Deployment**: Vercel

### Smart Contracts v2.0

Six core contracts power the upgraded platform:

**Base Chain Contracts:**
- **CreationManager** - Registers works and tracks creation relationships
- **AuthorizationManager** - Handles authorization requests and verifies permissions  
- **PaymentManager** - Manages tips and authorization fees (stored in contract)
- **NFTManager** - ERC721 contract for work ownership NFTs
- **NFTMarketplace** - NFT trading with instant royalty distribution
- **RoyaltyManager** - Unified royalty distribution logic

**ZetaChain Contract:**
- **ZetaPaymentManager** - Cross-chain payment processor

### Contract Interaction Flow

```
User (Register Original) → CreationManager.registerOriginalWork()
                          └─ Store work info

User (Request Auth) → AuthorizationManager.requestAuthorization()
                    ├─ CreationManager.getWork() [Query work info]
                    ├─ CreationManager.getCreatorChain() [Get ancestors]
                    └─ PaymentManager.distributeRevenue() [Split payment]

User (Register Derivative) → CreationManager.registerDerivativeWork()
                            └─ AuthorizationManager.hasAuthorization() [Verify auth]

User (Withdraw) → PaymentManager.withdraw()
                └─ Transfer balance
```

### Revenue Distribution Rules v2.0

**NFT Sales (Instant Payout):**
| Recipients | Share | Payment Method |
|------------|-------|----------------|
| **Seller** | 70% | Instant transfer |
| **Original Creator** | 20% | Instant transfer |
| **Middle Ancestors** | 10% | Instant transfer (split) |
| **Platform Fee** | 2.5% | Instant to platform |

**Authorization Fees & Tips (Contract Storage):**
| Recipients | Share | Payment Method |
|------------|-------|----------------|
| **Direct Creator** | 40% | Stored in contract |
| **Original Creator** | 40% | Stored in contract |
| **Middle Ancestors** | 20% | Stored in contract (split) |
| **Withdrawal Fee** | 3.5% | Deducted on withdrawal |

---

## 👥 Team

| Role | Member | Responsibilities |
|------|--------|------------------|
| **Project Management** | Xiaoyuan | Define scope, coordinate team, drive execution |
| **UI Design & Frontend** | Kekeke | Design interface, implement frontend |
| **Contract Development** | Xiaoguai | Write contracts, manage blockchain integration |
| **Database & Backend** | Jiajia | Setup database, provide APIs, implement data operations |
| **Project Coordination** | Relax | Logo design, documentation, coordinate meetings, testing |

---

## 🚀 Roadmap

### V1.0 (✅) - Foundation
**Goal**: Complete "Create → Authorize → Remix → Revenue Split → Withdraw" workflow

**Features**:
- Upload works and tip functionality
- Authorization request with automatic approval and status display
- Automatic revenue distribution across creation chain
- Creation system with tags and searchable categories

### V2.0 (✅) - Ecosystem Expansion
**Completed Features**:
- ✅ NFT integration (mint work ownership NFTs, trade with instant royalties)
- ✅ Cross-chain payment support via ZetaChain
- ✅ Instant royalty distribution for NFT sales
- ✅ Optimized fee structure (2.5% NFT trading, 3.5% withdrawal)
- ✅ Enhanced smart contract architecture with 6 specialized contracts

### V3.0 (Future) - Community & Incentives
**Upcoming**:
- Creator reputation and reward pool
- DAO governance (voting on rules, revenue distribution)
- Creator leaderboards (history, reputation, earnings, collaborations)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Alchemy API key
- Supabase account
- Pinata account

### Installation

```bash
# Clone repository
git clone https://github.com/iqnuxul/whichWitch.git
cd whichWitch

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
# Run src/backend/supabase/schema.sql in Supabase SQL Editor

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
whichWitch-main/
├── 📱 app/                   # Next.js App Router
│   ├── api/                  # API Routes (IPFS, users, works)
│   ├── app/                  # Main application page
│   └── page.tsx              # Landing page
├── 🧩 components/            # React Components
│   ├── landing/              # Landing page components
│   ├── ui/                   # Reusable UI components
│   └── whichwitch/           # Main app components
├── 📚 docs/                  # Documentation & guides
├── 📦 lib/                   # Utility libraries & integrations
│   ├── hooks/                # React hooks
│   ├── services/             # Business logic
│   ├── supabase/             # Database operations
│   └── web3/                 # Blockchain integration
├── 🔧 scripts/               # Utility scripts (organized by feature)
│   ├── contracts/            # Contract testing & verification
│   ├── database/             # Database management
│   ├── nft/                  # NFT operations
│   └── testing/              # Integration testing
└── 🏗️ src/                   # Source code
    ├── backend/supabase/     # Database migrations
    └── contracts/            # Smart contracts (v2.0)
```

📋 **Detailed Structure**: See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for complete organization details.

---

## 🤝 Partners

*Coming soon*

---

## 📬 Contact

For inquiries, please reach out through [GitHub Issues](https://github.com/iqnuxul/whichWitch/issues).
Email: mluxunqi@gamil.com

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

**Built with ❤️ by the WhichWitch Team**
