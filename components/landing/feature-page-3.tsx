"use client"

import { motion } from "framer-motion"
import { Vote, Users, Trophy, Gift, Badge, Coins } from "lucide-react"

export function FeaturePage3() {
  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Vote className="w-5 h-5" />
            <span className="font-medium">Feature 3</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Community-Driven
            </span>
            <br />
            <span className="text-foreground">
              Creative Direction Voting
            </span>
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Voting Process */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Voting Process
              </h3>
              
              <div className="space-y-4">
                <VotingStep
                  icon={<Vote className="w-5 h-5" />}
                  title="Creator Initiates Voting"
                  description="Creators initiate voting on work nodes for story direction/new skins, must stake tokens to guarantee delivery"
                  color="from-blue-500 to-cyan-500"
                />
                
                <VotingStep
                  icon={<Coins className="w-5 h-5" />}
                  title="Fan Staking & Voting"
                  description="Fans stake tokens to support specific options"
                  color="from-purple-500 to-pink-500"
                />
                
                <VotingStep
                  icon={<Trophy className="w-5 h-5" />}
                  title="Result Implementation"
                  description="After voting ends, creator implements winning option and receives large reward tokens"
                  color="from-green-500 to-emerald-500"
                />
              </div>
            </div>

            {/* Voting Example */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-4">Example Voting Scenario</h4>
              <div className="space-y-3">
                <VotingOption
                  option="A"
                  title="Cyberpunk Romance Arc"
                  votes="1,250 ZETA"
                  percentage="45%"
                  color="from-pink-500 to-red-500"
                  isWinner={true}
                />
                <VotingOption
                  option="B"
                  title="Space Adventure Arc"
                  votes="890 ZETA"
                  percentage="32%"
                  color="from-blue-500 to-purple-500"
                />
                <VotingOption
                  option="C"
                  title="Mystery Investigation Arc"
                  votes="640 ZETA"
                  percentage="23%"
                  color="from-green-500 to-teal-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Right - Reward System */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-500" />
                Reward Mechanism
              </h3>
              
              <div className="space-y-4">
                <RewardStep
                  icon={<Coins className="w-5 h-5" />}
                  title="Participation Rewards"
                  description="After voting ends, all participating fans get back staked tokens + receive participation reward tokens"
                  color="from-yellow-500 to-orange-500"
                />
                
                <RewardStep
                  icon={<Trophy className="w-5 h-5" />}
                  title="Creator Rewards"
                  description="After winning option is delivered, creator gets back staked tokens + receives large reward tokens"
                  color="from-green-500 to-emerald-500"
                />
                
                <RewardStep
                  icon={<Badge className="w-5 h-5" />}
                  title="Community Choice Label"
                  description="Work node receives 'Community Choice' label"
                  color="from-blue-500 to-cyan-500"
                />
                
                <RewardStep
                  icon={<Badge className="w-5 h-5" />}
                  title="Limited NFT Badges"
                  description="Fans who supported winning option receive limited NFT badges (work thumbnail + user ID hash generated random background color)"
                  color="from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* NFT Badge Preview */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Badge className="w-4 h-4 text-primary" />
                Limited NFT Badge Preview
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <NFTBadge
                  userHash="a1b2c3"
                  bgColor="from-pink-500 to-purple-600"
                  workTitle="Cyberpunk Character"
                />
                <NFTBadge
                  userHash="d4e5f6"
                  bgColor="from-blue-500 to-cyan-600"
                  workTitle="Cyberpunk Character"
                />
                <NFTBadge
                  userHash="g7h8i9"
                  bgColor="from-green-500 to-teal-600"
                  workTitle="Cyberpunk Character"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Each badge has unique background color generated from user ID hash
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function VotingStep({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function RewardStep({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function VotingOption({ option, title, votes, percentage, color, isWinner = false }: {
  option: string
  title: string
  votes: string
  percentage: string
  color: string
  isWinner?: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isWinner ? 'border-primary/50 bg-primary/5' : 'border-border/30 bg-card/20'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white font-bold text-sm`}>
          {option}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{title}</span>
            {isWinner && <Trophy className="w-4 h-4 text-primary" />}
          </div>
          <span className="text-sm text-muted-foreground">{votes} staked</span>
        </div>
      </div>
      <span className="font-mono text-sm text-foreground">{percentage}</span>
    </div>
  )
}

function NFTBadge({ userHash, bgColor, workTitle }: {
  userHash: string
  bgColor: string
  workTitle: string
}) {
  return (
    <div className={`aspect-square rounded-lg bg-gradient-to-br ${bgColor} p-2 flex flex-col items-center justify-center text-white text-center`}>
      <div className="w-8 h-8 bg-white/20 rounded mb-1 flex items-center justify-center">
        <Badge className="w-4 h-4" />
      </div>
      <div className="text-xs font-medium leading-tight">{workTitle}</div>
      <div className="text-xs opacity-75 font-mono">#{userHash}</div>
    </div>
  )
}