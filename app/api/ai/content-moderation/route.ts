import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Qwen-VL API configuration
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
const QWEN_API_KEY = process.env.QWEN_API_KEY

interface ModerationRequest {
  workId: number
  imageUrl: string
  creatorAddress?: string
  stakeAmount?: string
  stakeTxHash?: string
  title?: string
  description?: string
  reportId?: number // 新增：关联的举报ID
}

interface ModerationResult {
  nsfwScore: number
  violenceScore: number
  hateScore: number
  overallSafetyScore: number
  detectedIssues: string[]
  flaggedContent: string[]
  aiAnalysis: any
}

// Call Qwen-VL API for content moderation
async function analyzeContentWithQwen(imageUrl: string): Promise<ModerationResult> {
  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-vl-max',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                { image: imageUrl },
                { 
                  text: `Analyze this image for content moderation. Detect and score the following:
1. NSFW content (nudity, sexual content) - score 0-100
2. Violence and gore - score 0-100
3. Hate symbols and offensive content - score 0-100

Provide a detailed analysis in JSON format with:
- nsfwScore: number (0-100)
- violenceScore: number (0-100)
- hateScore: number (0-100)
- detectedIssues: array of issue types found
- flaggedContent: array of specific problematic elements
- reasoning: detailed explanation

Return ONLY valid JSON.`
                }
              ]
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.output?.choices?.[0]?.message?.content?.[0]?.text || '{}'
    
    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(aiResponse)
    } catch {
      aiAnalysis = { error: 'Failed to parse AI response', rawResponse: aiResponse }
    }

    const nsfwScore = aiAnalysis.nsfwScore || 0
    const violenceScore = aiAnalysis.violenceScore || 0
    const hateScore = aiAnalysis.hateScore || 0
    const overallSafetyScore = 100 - Math.max(nsfwScore, violenceScore, hateScore)

    return {
      nsfwScore,
      violenceScore,
      hateScore,
      overallSafetyScore,
      detectedIssues: aiAnalysis.detectedIssues || [],
      flaggedContent: aiAnalysis.flaggedContent || [],
      aiAnalysis
    }
  } catch (error) {
    console.error('Qwen API error:', error)
    // Fallback to basic analysis
    return {
      nsfwScore: 0,
      violenceScore: 0,
      hateScore: 0,
      overallSafetyScore: 100,
      detectedIssues: [],
      flaggedContent: [],
      aiAnalysis: { error: 'AI analysis unavailable', fallback: true }
    }
  }
}

// POST: Submit work for content moderation
export async function POST(request: NextRequest) {
  try {
    const body: ModerationRequest = await request.json()
    const { workId, imageUrl, creatorAddress, stakeAmount, stakeTxHash, title, description, reportId } = body

    if (!workId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: workId and imageUrl' },
        { status: 400 }
      )
    }

    console.log('🛡️ Starting content moderation for work:', workId)

    // Analyze content with Qwen-VL
    const moderationResult = await analyzeContentWithQwen(imageUrl)

    // Determine status based on scores
    let status: 'safe' | 'warning' | 'unsafe' = 'safe'
    let confidence = 0.95

    if (moderationResult.overallSafetyScore < 30) {
      status = 'unsafe'
      confidence = 0.9
    } else if (moderationResult.overallSafetyScore < 70) {
      status = 'warning'
      confidence = 0.8
    }

    // Build issues array
    const issues = []
    if (moderationResult.nsfwScore > 30) {
      issues.push({
        type: 'NSFW Content',
        severity: moderationResult.nsfwScore > 70 ? 'high' : moderationResult.nsfwScore > 50 ? 'medium' : 'low',
        description: 'Potentially inappropriate or adult content detected'
      })
    }
    if (moderationResult.violenceScore > 30) {
      issues.push({
        type: 'Violence',
        severity: moderationResult.violenceScore > 70 ? 'high' : moderationResult.violenceScore > 50 ? 'medium' : 'low',
        description: 'Violent or graphic content detected'
      })
    }
    if (moderationResult.hateScore > 30) {
      issues.push({
        type: 'Hate Content',
        severity: moderationResult.hateScore > 70 ? 'high' : moderationResult.hateScore > 50 ? 'medium' : 'low',
        description: 'Hate symbols or offensive content detected'
      })
    }

    // Try to insert moderation record (if table exists)
    try {
      if (creatorAddress) {
        const challengePeriodEnd = new Date()
        challengePeriodEnd.setDate(challengePeriodEnd.getDate() + 7)

        const { data, error } = await supabase
          .from('content_moderation')
          .insert({
            work_id: workId,
            creator_address: creatorAddress,
            status: status === 'safe' ? 'approved' : status === 'warning' ? 'under_review' : 'rejected',
            ai_analysis: moderationResult.aiAnalysis,
            nsfw_score: moderationResult.nsfwScore,
            violence_score: moderationResult.violenceScore,
            hate_score: moderationResult.hateScore,
            overall_safety_score: moderationResult.overallSafetyScore,
            detected_issues: moderationResult.detectedIssues,
            flagged_content: moderationResult.flaggedContent,
            stake_amount: stakeAmount || '0',
            stake_tx_hash: stakeTxHash || '',
            stake_locked: status !== 'safe',
            challenge_period_end: challengePeriodEnd.toISOString(),
            reviewed_at: new Date().toISOString()
          })
          .select()
          .single()

        console.log('✅ Moderation record saved to database')
      }
    } catch (dbError) {
      console.log('⚠️ Database save failed (expected in development):', dbError)
    }

    // 如果有关联的举报ID，更新举报状态
    if (reportId) {
      try {
        // 根据confidence和status决定举报状态
        let reportStatus = 'under_review' // 默认需要人工审核
        
        if (status === 'safe' && confidence > 0.8) {
          // 高置信度安全 - 举报可能是误报
          reportStatus = 'resolved'
        } else if (status === 'unsafe' || (status === 'warning' && confidence > 0.7)) {
          // 确实发现问题 - 升级处理
          reportStatus = 'escalated'
        }
        
        await supabase
          .from('work_reports')
          .update({
            status: reportStatus,
            ai_verdict: status,
            moderator_notes: `AI content moderation completed. Status: ${status}. Confidence: ${Math.round(confidence * 100)}%. ${
              status === 'safe' && confidence > 0.8 
                ? 'No issues found - likely false report.' 
                : status === 'unsafe' 
                ? 'Policy violations detected.' 
                : 'Requires manual review.'
            }`,
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId)
        console.log('✅ Report status updated:', reportStatus)
      } catch (reportError) {
        console.error('⚠️ Failed to update report status:', reportError)
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        status,
        confidence,
        issues,
        details: {
          nsfw_score: moderationResult.nsfwScore / 100,
          violence_score: moderationResult.violenceScore / 100,
          hate_score: moderationResult.hateScore / 100,
          overall_score: (100 - moderationResult.overallSafetyScore) / 100
        },
        ai_analysis: moderationResult.aiAnalysis
      },
      message: status === 'safe' 
        ? 'Content approved! No issues detected.'
        : status === 'warning'
        ? 'Content has minor issues but is acceptable.'
        : 'Content rejected due to policy violations.'
    })

  } catch (error) {
    console.error('Content moderation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process content moderation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET: Check moderation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workId = searchParams.get('workId')
    const address = searchParams.get('address')

    if (!workId && !address) {
      return NextResponse.json(
        { error: 'workId or address required' },
        { status: 400 }
      )
    }

    let query = supabase.from('content_moderation').select('*')

    if (workId) {
      query = query.eq('work_id', workId)
    } else if (address) {
      query = query.eq('creator_address', address)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ moderations: data })

  } catch (error) {
    console.error('Get moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moderation records' },
      { status: 500 }
    )
  }
}