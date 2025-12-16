# Manual Upload Guide for Competition Submission

## 📦 Files Ready for Upload

All files are prepared in: `submission/whichWitch/`

## 🌐 Method 1: Upload via GitHub Web Interface (Easiest)

### Step 1: Navigate to Your Fork
1. Go to https://github.com/iqnuxul/WWW5.5
2. Click on `projects` folder (or create it if it doesn't exist)

### Step 2: Upload Files
1. Click "Add file" → "Upload files"
2. Drag and drop the entire `submission/whichWitch` folder
3. Or click "choose your files" and select all files from `submission/whichWitch/`

### Step 3: Commit Changes
**Commit message**:
```
feat: Submit WhichWitch project for competition

WhichWitch - On-Chain Creation Platform

Core Features:
- Register original works on blockchain
- Derivative work authorization management
- Automatic revenue distribution
- Creation genealogy tracking

Tech Stack:
- Frontend: Next.js 14, React, TailwindCSS
- Blockchain: Ethereum (Sepolia), Solidity
- Database: Supabase
- Storage: IPFS (Pinata)

Live Demo: https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/
Presentation: https://www.canva.com/design/DAG5t6aAKIU/...
```

4. Click "Commit changes"

### Step 4: Create Pull Request
1. Go to https://github.com/iqnuxul/WWW5.5
2. Click "Pull requests" → "New pull request"
3. Base: `openbuildxyz/WWW5.5` main
4. Head: `iqnuxul/WWW5.5` main
5. Title: `[Project Submission] WhichWitch - On-Chain Creation Platform`
6. Description: (see below)
7. Click "Create pull request"

## 📝 Pull Request Description Template

```markdown
## Project Name
WhichWitch

## Tagline
Let creation be a tree that can see its own growth.

## Description
A decentralized on-chain creation platform that enables creators to register original works, manage derivative authorizations, and automatically distribute revenue across the creation chain.

## Core Features
- 🔗 On-chain registration of original works
- 💰 Automatic revenue distribution (40%-40%-20%)
- 🎨 Derivative work authorization management
- 📊 Creation genealogy tracking
- 💸 Pull-based withdrawal pattern

## Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Blockchain**: Ethereum (Sepolia Testnet), Solidity
- **Database**: Supabase (PostgreSQL)
- **Storage**: IPFS (Pinata)
- **Deployment**: Vercel

## Links
- 🌐 **Live Demo**: https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/
- 📊 **Presentation**: https://www.canva.com/design/DAG5t6aAKIU/JLK99jHgZNk_ge5mS-qDsQ/view
- 💻 **GitHub**: https://github.com/iqnuxul/whichWitch

## Smart Contracts (Sepolia Testnet)
- **CreationManager**: `0x166253a474D74738D47CB59Ab39ee08e4fA4E607`
- **PaymentManager**: `0x4CD314D46F1d09af04fb7784F9083468206D3858`
- **AuthorizationManager**: `0x975830aA477523448F407eF6769D4A21F1A1724D`

## Team
- **Xiaoyuan** - Project Management
- **Kekeke** - UI Design & Frontend Development
- **Xiaoguai** - Smart Contract Development
- **Jiajia** - Database & Backend Development
- **Relax** - Project Coordination & Documentation

## Submission Contents
- ✅ Complete source code (contracts, frontend, backend)
- ✅ Project documentation
- ✅ Live demo
- ✅ Presentation slides
```

---

## 🌐 Method 2: Using GitHub Desktop (If you prefer GUI)

### Step 1: Install GitHub Desktop
Download from: https://desktop.github.com/

### Step 2: Clone Your Fork
1. Open GitHub Desktop
2. File → Clone Repository
3. Select `iqnuxul/WWW5.5`
4. Choose location and clone

### Step 3: Copy Files
1. Open the cloned repository folder
2. Create `projects` folder if it doesn't exist
3. Copy `submission/whichWitch` folder into `projects/`

### Step 4: Commit and Push
1. GitHub Desktop will show changes
2. Write commit message (see template above)
3. Click "Commit to main"
4. Click "Push origin"

### Step 5: Create Pull Request
Follow Step 4 from Method 1

---

## 📋 Checklist Before Submission

- [ ] All source code included in `src/` directory
- [ ] README.md is complete and properly formatted
- [ ] docs/LINKS.md contains all links
- [ ] No sensitive information (.env.local, etc.)
- [ ] No node_modules included
- [ ] Contract addresses are correct
- [ ] Live demo link is accessible
- [ ] Presentation link is accessible

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the competition repository requirements
2. Review other project submissions for reference
3. Contact competition organizers

**Good luck with your submission! 🎉**
