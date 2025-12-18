"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, RefreshCw, Upload, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface UploadResultPageProps {
  workData: {
    id?: number
    title: string
    image: string
    creator: string
  }
  onBackToSquare: () => void
  onRetry?: () => void
}

type UploadStatus = 'uploading' | 'processing' | 'success' | 'error' | 'timeout'

export function UploadResultPage({ workData, onBackToSquare, onRetry }: UploadResultPageProps) {
  const [status, setStatus] = useState<UploadStatus>('uploading')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Uploading your work...')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)

  // 模拟上传和处理流程
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    const simulateUpload = async () => {
      // 第一阶段：上传到IPFS (0-30%)
      setMessage('Uploading to IPFS...')
      for (let i = 0; i <= 30; i += 2) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 第二阶段：AI内容审核 (30-70%)
      setMessage('AI content moderation in progress...')
      setStatus('processing')
      for (let i = 30; i <= 70; i += 1) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      // 第三阶段：区块链处理 (70-100%)
      setMessage('Processing on blockchain...')
      for (let i = 70; i <= 100; i += 1) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 模拟随机结果
      const random = Math.random()
      if (random > 0.8) {
        setStatus('error')
        setMessage('Upload failed. Please try again.')
      } else {
        setStatus('success')
        setMessage('Work uploaded successfully!')
      }
    }

    simulateUpload()

    // 超时检测 (60秒)
    const timeoutTimer = setTimeout(() => {
      if (status === 'uploading' || status === 'processing') {
        setShowTimeoutWarning(true)
      }
    }, 60000)

    // 自动跳转超时 (120秒)
    const autoRedirectTimer = setTimeout(() => {
      if (status === 'uploading' || status === 'processing') {
        setStatus('timeout')
        setMessage('Upload is taking longer than expected.')
      }
    }, 120000)

    return () => {
      clearInterval(timer)
      clearTimeout(timeoutTimer)
      clearTimeout(autoRedirectTimer)
    }
  }, [status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />
      case 'timeout':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'timeout':
        return 'text-yellow-600'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            {/* 作品预览 */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-border shadow-lg">
                  <img 
                    src={workData.image} 
                    alt={workData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 状态指示器 */}
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 border-2 border-border shadow-lg">
                  {getStatusIcon()}
                </div>
              </div>
            </div>

            {/* 状态信息 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{workData.title}</h2>
              <p className="text-muted-foreground">by {workData.creator}</p>
              
              <div className={`text-lg font-medium ${getStatusColor()}`}>
                {message}
              </div>

              {/* 进度条 */}
              {(status === 'uploading' || status === 'processing') && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progress}% complete</span>
                    <span>Time: {formatTime(timeElapsed)}</span>
                  </div>
                </div>
              )}

              {/* 处理步骤 */}
              {(status === 'uploading' || status === 'processing') && (
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={progress > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                      Upload to IPFS
                    </span>
                    {progress > 30 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress > 30 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className={progress > 30 ? 'text-green-600' : progress > 0 ? 'text-blue-600' : 'text-muted-foreground'}>
                      AI Content Moderation
                    </span>
                    {progress > 70 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress > 70 ? 'bg-green-500' : progress > 30 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className={progress > 70 ? 'text-green-600' : progress > 30 ? 'text-blue-600' : 'text-muted-foreground'}>
                      Blockchain Processing
                    </span>
                    {progress >= 100 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              )}

              {/* 超时警告 */}
              {showTimeoutWarning && (status === 'uploading' || status === 'processing') && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Taking longer than usual</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Network congestion may be causing delays. Please wait or try again later.
                  </p>
                </div>
              )}

              {/* 成功消息 */}
              {status === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">
                    🎉 Your work has been successfully uploaded and is now visible on the platform!
                  </p>
                </div>
              )}

              {/* 错误消息 */}
              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    ❌ Upload failed. This could be due to network issues or content policy violations.
                  </p>
                </div>
              )}

              {/* 超时消息 */}
              {status === 'timeout' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-600">
                    ⏰ Upload is taking longer than expected. You can return to the square and check back later.
                  </p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onBackToSquare}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Square
              </Button>

              {status === 'error' && onRetry && (
                <Button
                  onClick={onRetry}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Upload
                </Button>
              )}

              {status === 'success' && (
                <Button
                  onClick={onBackToSquare}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  View Work
                </Button>
              )}

              {status === 'timeout' && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>

            {/* 帮助信息 */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {status === 'uploading' || status === 'processing' 
                  ? 'Please keep this page open while processing...'
                  : status === 'success'
                  ? 'Your work is now live on the platform!'
                  : 'Need help? Contact support if issues persist.'
                }
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}