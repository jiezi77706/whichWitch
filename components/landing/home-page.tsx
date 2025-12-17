"use client"

import { motion } from "framer-motion"
import { Users, Zap, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HomePage() {
  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Creative
              </span>
              <br />
              <span className="text-foreground">
                Collaboration
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              A decentralized platform where original creators and derivative artists collaborate, 
              share revenue, and build creative communities through blockchain technology.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Target Users & Scenarios</h2>
            <div className="space-y-3">
              <UserScenario
                icon={<Users className="w-5 h-5" />}
                title="Original Creators"
                description="Illustrators, novelists, character designers seeking to protect IP rights and earn continuous revenue"
              />
              <UserScenario
                icon={<Zap className="w-5 h-5" />}
                title="Derivative Creators"
                description="Fan artists, mod makers willing to pay for quality IP and create compliant derivative works"
              />
              <UserScenario
                icon={<Globe className="w-5 h-5" />}
                title="Fan Communities"
                description="Support favorite works through staking, participate in creative direction voting, share creation revenue"
              />
            </div>
          </div>
        </motion.div>

        {/* Right Content - Scenario Flow */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">Typical Scenario</h3>
            
            <ScenarioStep
              step="1"
              title="Original Creation"
              description="Alice creates cyberpunk character (stakes 10 ZETA)"
              color="from-blue-500 to-cyan-500"
            />
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <ScenarioStep
              step="2"
              title="Licensed Derivative"
              description="Bob pays 0.1 ETH for authorization, creates fan manga"
              color="from-purple-500 to-pink-500"
            />
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <ScenarioStep
              step="3"
              title="Second Derivative"
              description="Charlie uses BNB for authorization, creates game mod based on Bob's manga"
              color="from-green-500 to-emerald-500"
            />
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <ScenarioStep
              step="4"
              title="Revenue Distribution"
              description="Automatic split: Alice 40%, Bob 20%, Charlie 40%"
              color="from-yellow-500 to-orange-500"
            />
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <ScenarioStep
              step="5"
              title="Community Engagement"
              description="Fans stake ZETA to vote on 'next chapter direction', earn rewards and limited NFT badges"
              color="from-red-500 to-pink-500"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function UserScenario({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ScenarioStep({ step, title, description, color }: {
  step: string
  title: string
  description: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white text-sm font-bold`}>
        {step}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}