"use client"

import dynamic from "next/dynamic"

// Dynamically import the ModerationDashboard to avoid SSR issues with Web3
const ModerationDashboard = dynamic(
  () => import("@/components/whichwitch/moderation-dashboard").then(mod => ({ default: mod.ModerationDashboard })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-20">Loading moderation dashboard...</div>
  }
)

export default function ModerationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ModerationDashboard />
    </div>
  )
}
