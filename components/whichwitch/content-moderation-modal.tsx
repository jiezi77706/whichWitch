"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle2, XCircle, Eye, Clock } from "lucide-react"

interface ModerationResult {
  status: 'safe' | 'unsafe' | 'warning'
  confidence: number
  issues: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
  details: {
    nsfw_score: number
    violence_score: number
    hate_score: number
    overall_score: number
  }
}

export function ContentModerationModal({
  open,
  onOpenChange,
  work,
  onModerationComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  work: any
  onModerationComplete?: (result: ModerationResult) => void
}) {
  const [status, setStatus] = useState<"idle" | "scanning" | "completed" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ModerationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleStartModeration = async () => {
    setStatus("scanning")
    setProgress(0)
    setErrorMessage("")

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 500)

      // 调用AI内容审核API
      const response = await fetch('/api/ai/content-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId: work.id || work.work_id,
          imageUrl: work.image_url || work.image,
          title: work.title,
          description: work.story || work.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Moderation failed')
      }

      clearInterval(progressInterval)
      setProgress(100)

      // 处理审核结果
      const moderationResult: ModerationResult = {
        status: data.result.status,
        confidence: data.result.confidence,
        issues: data.result.issues || [],
        details: data.result.details || {
          nsfw_score: 0,
          violence_score: 0,
          hate_score: 0,
          overall_score: 0,
        }
      }

      setResult(moderationResult)
      setStatus("completed")

      if (onModerationComplete) {
        onModerationComplete(moderationResult)
      }

    } catch (error) {
      console.error('Content moderation failed:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Moderation failed')
      setStatus("error")
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "scanning":
        return <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      case "completed":
        return result?.status === 'safe' ? 
          <CheckCircle2 className="w-6 h-6 text-green-500" /> :
          result?.status === 'warning' ?
          <AlertTriangle className="w-6 h-6 text-yellow-500" /> :
          <XCircle className="w-6 h-6 text-red-500" />
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Shield className="w-6 h-6 text-blue-500" />
    }
  }

  const getStatusColor = () => {
    if (result?.status === 'safe') return 'text-green-600'
    if (result?.status === 'warning') return 'text-yellow-600'
    if (result?.status === 'unsafe') return 'text-red-600'
    return 'text-blue-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            AI Content Moderation
          </DialogTitle>
          <DialogDescription>
            Automated content safety review using Qwen-VL AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 作品预览 */}
          <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={work?.image_url || work?.image || "/placeholder.svg"} 
                alt={work?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{work?.title}</h4>
              <p className="text-sm text-muted-foreground">
                by {work?.creator_address?.slice(0, 6)}...{work?.creator_address?.slice(-4)}
              </p>
              <Badge variant="outline" className="mt-1">
                <Eye className="w-3 h-3 mr-1" />
                Content Review
              </Badge>
            </div>
          </div>

          {/* 状态显示 */}
          {status === "idle" && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                AI will scan your content for:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-red-50 rounded border">
                  <span className="font-medium">NSFW Content</span>
                </div>
                <div className="p-2 bg-red-50 rounded border">
                  <span className="font-medium">Violence</span>
                </div>
                <div className="p-2 bg-red-50 rounded border">
                  <span className="font-medium">Hate Symbols</span>
                </div>
                <div className="p-2 bg-red-50 rounded border">
                  <span className="font-medium">Harmful Content</span>
                </div>
              </div>
            </div>
          )}

          {status === "scanning" && (
            <div className="text-center py-6">
              <div className="mb-4">
                <div className="animate-pulse text-blue-600 font-medium">
                  Scanning content...
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI is analyzing your image for safety
                </p>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {status === "completed" && result && (
            <div className="space-y-4">
              {/* 审核结果 */}
              <div className={`text-center py-4 ${getStatusColor()}`}>
                <div className="text-lg font-bold mb-2">
                  {result.status === 'safe' && 'Content Approved ✓'}
                  {result.status === 'warning' && 'Content Warning ⚠'}
                  {result.status === 'unsafe' && 'Content Rejected ✗'}
                </div>
                <p className="text-sm">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>

              {/* 详细分数 */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Safety Scores</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span>NSFW Content</span>
                    <span className={result.details.nsfw_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
                      {Math.round(result.details.nsfw_score * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Violence</span>
                    <span className={result.details.violence_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
                      {Math.round(result.details.violence_score * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hate Content</span>
                    <span className={result.details.hate_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
                      {Math.round(result.details.hate_score * 100)}%
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-medium">
                    <span>Overall Safety</span>
                    <span className={result.details.overall_score > 0.5 ? 'text-red-500' : 'text-green-500'}>
                      {Math.round((1 - result.details.overall_score) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 问题列表 */}
              {result.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Issues Found</h4>
                  <div className="space-y-1">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border text-xs">
                        <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{issue.type}</span>
                          <span className="text-muted-foreground"> - {issue.description}</span>
                        </div>
                        <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'} className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-6">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-medium text-red-600 mb-2">Moderation Failed</h3>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          )}

          {/* 说明信息 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600">
              <Clock className="w-3 h-3 inline mr-1" />
              This AI review helps ensure platform safety and compliance with community guidelines.
            </p>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-2 pt-4">
          {status === "idle" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartModeration} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Shield className="w-4 h-4 mr-2" />
                Start Review
              </Button>
            </>
          )}

          {status === "scanning" && (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          )}

          {(status === "completed" || status === "error") && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
              {status === "error" && (
                <Button onClick={handleStartModeration} className="flex-1">
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}