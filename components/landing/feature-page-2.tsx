"use client"

import { motion } from "framer-motion"
import { Brain, Shield, AlertTriangle, CheckCircle, Clock, Gavel } from "lucide-react"

export function FeaturePage2() {
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
            <Brain className="w-5 h-5" />
            <span className="font-medium">Feature 2</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              AI-Powered Content Moderation
            </span>
            <br />
            <span className="text-foreground">
              & Copyright Dispute Arbitration
            </span>
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Content Moderation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Content Moderation (Upload Time)
              </h3>
              
              <div className="space-y-4">
                <ModerationStep
                  icon={<AlertTriangle className="w-5 h-5" />}
                  title="AI Pre-screening on Upload"
                  description="Creators must stake tokens when uploading works, Qwen-VL automatically scans for sensitive content"
                  color="from-yellow-500 to-orange-500"
                />
                
                <ModerationStep
                  icon={<Brain className="w-5 h-5" />}
                  title="Detection Items"
                  description="NSFW content / Violence & gore / Hate symbols and other inappropriate content"
                  color="from-red-500 to-pink-500"
                />
                
                <ModerationStep
                  icon={<CheckCircle className="w-5 h-5" />}
                  title="Approval Rewards"
                  description="After passing review, immediately mint work NFT certificate for creator"
                  color="from-green-500 to-emerald-500"
                />
                
                <ModerationStep
                  icon={<Clock className="w-5 h-5" />}
                  title="7-Day Challenge Period"
                  description="No reports = stake returned, reports received = enter AI arbitration process"
                  color="from-blue-500 to-cyan-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Right - Copyright Arbitration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-purple-500" />
                Copyright Arbitration (Report Time)
              </h3>
              
              <div className="space-y-4">
                <ArbitrationStep
                  step="1"
                  title="Report Trigger"
                  description="User reports plagiarism → Lock both parties' staked tokens → AI generates arbitration report"
                  color="from-red-500 to-red-600"
                />
                
                <ArbitrationStep
                  step="2"
                  title="AI Analysis"
                  description="Overall similarity score (0-100%) + Dispute area annotation (character features/color schemes/composition)"
                  color="from-blue-500 to-blue-600"
                />
                
                <ArbitrationStep
                  step="3"
                  title="Timeline Comparison"
                  description="Timeline comparison analysis + AI recommended conclusion"
                  color="from-purple-500 to-purple-600"
                />
              </div>
            </div>

            {/* AI Report Example */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Arbitration Report Content
              </h4>
              <div className="space-y-3 text-sm">
                <ReportItem
                  label="Similarity Score"
                  value="87%"
                  color="text-red-400"
                />
                <ReportItem
                  label="Character Features"
                  value="High similarity detected"
                  color="text-orange-400"
                />
                <ReportItem
                  label="Color Scheme"
                  value="Moderate similarity"
                  color="text-yellow-400"
                />
                <ReportItem
                  label="Composition"
                  value="Low similarity"
                  color="text-green-400"
                />
                <ReportItem
                  label="Timeline Analysis"
                  value="Original: 2024-01-15, Disputed: 2024-02-20"
                  color="text-blue-400"
                />
                <ReportItem
                  label="AI Conclusion"
                  value="Potential copyright infringement detected"
                  color="text-red-400"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ModerationStep({ icon, title, description, color }: {
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

function ArbitrationStep({ step, title, description, color }: {
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
        <h4 className="font-medium text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ReportItem({ label, value, color }: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-mono ${color}`}>{value}</span>
    </div>
  )
}