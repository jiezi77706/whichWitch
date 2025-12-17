"use client"

import { motion } from "framer-motion"
import { Coins, ArrowRight, Shield, Globe, Percent } from "lucide-react"

export function FeaturePage1() {
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
            <Coins className="w-5 h-5" />
            <span className="font-medium">Feature 1</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Multi-Chain Revenue Sharing
            </span>
            <br />
            <span className="text-foreground">
              Automatic Distribution System
            </span>
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Authorization Scope & Pricing"
              description="Creators set authorization ranges (commercial/non-commercial/derivative restrictions) and pricing"
              color="from-blue-500 to-cyan-500"
            />

            <FeatureCard
              icon={<ArrowRight className="w-6 h-6" />}
              title="Authorization Chain Tracing"
              description="When derivative creators pay authorization fees, smart contracts automatically trace the complete creation chain and distribute revenue"
              color="from-purple-500 to-pink-500"
            />

            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Cross-Chain Unified Payment"
              description="Users can pay authorization fees with any chain assets (ETH/BNB/BTC etc.), creators receive unified settlement revenue"
              color="from-green-500 to-emerald-500"
            />
          </motion.div>

          {/* Right - Revenue Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                Revenue Distribution Rules
              </h3>
              
              <div className="space-y-4">
                <RevenueRule
                  scenario="Standard Distribution"
                  original="40%"
                  middle="20%"
                  direct="40%"
                  description="Original 40% / Middle layers share 20% / Direct parent work 40%"
                />
                
                <RevenueRule
                  scenario="No Middle Layers"
                  original="60%"
                  middle="0%"
                  direct="40%"
                  description="When no middle layers exist, original gets 60% (40% + 20%)"
                />
                
                <RevenueRule
                  scenario="Original Only"
                  original="100%"
                  middle="0%"
                  direct="0%"
                  description="When only original exists, original gets 100%"
                />
              </div>
            </div>

            {/* Visual Flow */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-4">Payment Flow Example</h4>
              <div className="space-y-3">
                <FlowStep
                  from="User"
                  to="Smart Contract"
                  asset="0.1 ETH"
                  color="from-blue-500 to-blue-600"
                />
                <FlowStep
                  from="Smart Contract"
                  to="Original Creator"
                  asset="0.04 ETH (40%)"
                  color="from-green-500 to-green-600"
                />
                <FlowStep
                  from="Smart Contract"
                  to="Middle Creators"
                  asset="0.02 ETH (20%)"
                  color="from-purple-500 to-purple-600"
                />
                <FlowStep
                  from="Smart Contract"
                  to="Direct Parent"
                  asset="0.04 ETH (40%)"
                  color="from-orange-500 to-orange-600"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-3">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${color} text-white`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function RevenueRule({ scenario, original, middle, direct, description }: {
  scenario: string
  original: string
  middle: string
  direct: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{scenario}</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">{original}</span>
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">{middle}</span>
          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">{direct}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FlowStep({ from, to, asset, color }: {
  from: string
  to: string
  asset: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground min-w-[80px]">{from}</span>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground min-w-[100px]">{to}</span>
      <span className={`text-sm font-mono px-2 py-1 rounded bg-gradient-to-r ${color} text-white`}>
        {asset}
      </span>
    </div>
  )
}