"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react"
import { useAccount } from "wagmi"
import { DisputeReportViewer } from "./dispute-report-viewer"

export function ModerationDashboard() {
  const { address } = useAccount()
  const [moderations, setModerations] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchData()
    }
  }, [address])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const modResponse = await fetch(`/api/ai/content-moderation?address=${address}`)
      const modData = await modResponse.json()
      setModerations(modData.moderations || [])

      const dispResponse = await fetch(`/api/ai/copyright-dispute?address=${address}`)
      const dispData = await dispResponse.json()
      setDisputes(dispData.disputes || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      approved: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
      rejected: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
      pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle },
      under_review: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Eye },
      analyzing: { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Eye },
      resolved: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
    }

    const variant = variants[status] || variants.pending
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please connect your wallet to view moderation dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">AI Moderation Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            View content moderation results and copyright disputes
          </p>
        </div>
      </div>

      <Tabs defaultValue="moderations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="moderations">
            Content Moderation ({moderations.length})
          </TabsTrigger>
          <TabsTrigger value="disputes">
            Copyright Disputes ({disputes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderations" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : moderations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No moderation records found
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {moderations.map((mod) => (
                  <Card key={mod.id} className="p-4">
                    <p className="font-semibold">{mod.work?.title || `Work #${mod.work_id}`}</p>
                    {getStatusBadge(mod.status)}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No copyright disputes found
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {disputes.map((dispute) => (
                  <Card key={dispute.id} className="p-4">
                    <p className="font-semibold">Dispute #{dispute.id}</p>
                    {getStatusBadge(dispute.status)}
                    <Button
                      onClick={() => setSelectedDispute(dispute)}
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Report
                    </Button>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      <DisputeReportViewer
        isOpen={!!selectedDispute}
        onClose={() => setSelectedDispute(null)}
        dispute={selectedDispute}
      />
    </div>
  )
}
