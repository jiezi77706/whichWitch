# 🏗️ WhichWitch Project Structure

## 📁 Directory Overview

```
whichWitch-main/
├── 📱 app/                          # Next.js App Router
│   ├── api/                         # API Routes
│   │   ├── ipfs/                    # IPFS upload endpoints
│   │   ├── users/                   # User management
│   │   └── works/                   # Work management
│   ├── app/                         # Main application page
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page
│
├── 🧩 components/                   # React Components
│   ├── landing/                     # Landing page components
│   │   ├── home-page.tsx
│   │   ├── feature-page-1.tsx
│   │   ├── feature-page-2.tsx
│   │   ├── feature-page-3.tsx
│   │   └── landing-container.tsx
│   ├── providers/                   # Context providers
│   ├── ui/                          # Reusable UI components
│   ├── whichwitch/                  # Main app components
│   │   ├── auth-view.tsx
│   │   ├── upload-view.tsx
│   │   ├── square-view.tsx
│   │   ├── collections-view.tsx
│   │   ├── profile-view.tsx
│   │   ├── nft-*.tsx               # NFT related components
│   │   └── app-container.tsx
│   ├── theme-provider.tsx
│   └── wallet-connect-button.tsx
│
├── 📚 docs/                         # Documentation
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── DATABASE_SYNC_SOLUTION.md    # Database sync fixes
│   ├── IPFS_NFT_INTEGRATION_SUMMARY.md
│   ├── LANDING_PAGE_SUMMARY.md
│   ├── database-v2-analysis.md
│   ├── nft-minting-test-guide.md
│   ├── v2-ipfs-nft-integration.md
│   ├── MANUAL_UPLOAD_GUIDE.md
│   ├── NFT_MINTING_TROUBLESHOOTING.md
│   ├── QUICK_NFT_TEST_GUIDE.md
│   ├── GITHUB_SETUP.md
│   └── COMPETITION_SUBMISSION_GUIDE.md
│
├── 📦 lib/                          # Utility Libraries
│   ├── hooks/                       # React hooks
│   │   ├── useWorks.ts
│   │   ├── useUser.ts
│   │   └── useCollections.ts
│   ├── ipfs/                        # IPFS integration
│   │   └── pinata.service.ts
│   ├── services/                    # Business logic
│   │   └── work-nft-integration.service.ts
│   ├── supabase/                    # Database
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── services/
│   ├── web3/                        # Blockchain integration
│   │   ├── contracts/
│   │   ├── hooks/
│   │   └── services/
│   ├── mock-data.ts
│   └── utils.ts
│
├── 🔧 scripts/                      # Utility Scripts
│   ├── contracts/                   # Contract related scripts
│   │   ├── check-contract-state.js
│   │   ├── test-contract-integration.js
│   │   └── verify-contracts.js
│   ├── database/                    # Database related scripts
│   │   ├── check-database-works.js
│   │   ├── debug-work-creation.js
│   │   ├── diagnose-database-sync.js
│   │   ├── fix-database-sync.js
│   │   ├── manual-sync-work.js
│   │   ├── test-database-api.js
│   │   └── update-database-v2.js
│   ├── nft/                         # NFT related scripts
│   │   ├── diagnose-nft-minting.js
│   │   ├── diagnose-transaction-failure.js
│   │   ├── quick-nft-test.js
│   │   └── verify-nft-contracts.js
│   └── testing/                     # Testing scripts
│       └── test-ipfs-integration.js
│
├── 🏗️ src/                          # Source Code
│   ├── backend/                     # Backend related
│   │   └── supabase/
│   │       └── migrations/          # Database migrations
│   ├── contracts/                   # Smart contracts
│   │   ├── src/                     # Solidity contracts
│   │   └── README.md
│   └── ui/                          # UI related utilities
│
├── 🖼️ public/                       # Static Assets
│   └── logos/
│
├── ⚙️ Configuration Files
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment variables
├── .gitignore                       # Git ignore rules
├── components.json                  # shadcn/ui config
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Dependencies
├── postcss.config.mjs               # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── CHANGELOG.md                     # Version history
├── COMMIT_MESSAGE_TEMPLATE.txt      # Git commit template
├── LICENSE                          # License file
├── prepare-submission.sh            # Deployment script
└── README.md                        # Project documentation
```

## 🎯 Key Features by Directory

### 📱 App Router (`app/`)
- **Landing Page**: Scroll-based introduction with 4 feature pages
- **Main App**: Full WhichWitch application at `/app`
- **API Routes**: RESTful endpoints for IPFS, users, and works

### 🧩 Components (`components/`)
- **Landing**: Marketing and introduction pages
- **WhichWitch**: Core application components
- **UI**: Reusable design system components
- **Providers**: React context and state management

### 📦 Libraries (`lib/`)
- **Hooks**: Custom React hooks for data fetching
- **Services**: Business logic and API integrations
- **Web3**: Blockchain and smart contract interactions
- **Supabase**: Database operations and queries

### 🔧 Scripts (`scripts/`)
- **Contracts**: Smart contract testing and verification
- **Database**: Data synchronization and debugging
- **NFT**: NFT minting and marketplace operations
- **Testing**: Integration and unit testing utilities

### 🏗️ Source (`src/`)
- **Contracts**: Solidity smart contracts (v2.0)
- **Backend**: Database migrations and server logic
- **UI**: Design system and component utilities

## 🚀 Development Workflow

### 1. Frontend Development
```bash
npm run dev                    # Start development server
```

### 2. Smart Contract Development
```bash
cd src/contracts
forge build                   # Compile contracts
forge test                    # Run tests
```

### 3. Database Management
```bash
node scripts/database/update-database-v2.js    # Update schema
node scripts/database/test-database-api.js     # Test API
```

### 4. NFT Operations
```bash
node scripts/nft/quick-nft-test.js            # Test NFT minting
node scripts/nft/verify-nft-contracts.js      # Verify contracts
```

## 📋 File Organization Principles

### ✅ Organized by Feature
- Related files are grouped together
- Clear separation of concerns
- Logical directory structure

### ✅ Consistent Naming
- kebab-case for files and directories
- Descriptive and meaningful names
- Clear purpose indication

### ✅ Documentation First
- Every major feature has documentation
- Setup and troubleshooting guides
- API and integration examples

### ✅ Environment Separation
- Development vs production configs
- Secure environment variable handling
- Clear deployment procedures

## 🎯 Next Steps

1. **Development**: Use the organized structure for efficient development
2. **Documentation**: Keep docs updated as features evolve
3. **Testing**: Utilize organized scripts for comprehensive testing
4. **Deployment**: Follow the structured approach for reliable deployments

This organization ensures maintainability, scalability, and ease of collaboration for the WhichWitch platform.