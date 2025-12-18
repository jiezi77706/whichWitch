import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Qwen-VL API configuration for copyright analysis
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
const QWEN_API_KEY = process.env.QWEN_API_KEY

interface CopyrightArbitrationRequest {
  reportId: number
  reportedWorkId: number
  originalWorkId: number
}

interface ArbitrationResult {
  similarityScore: number
  disputedAreas: string[]
  timelineAnalysis: any
  recommendation: string
  confidence: number
  detailedAnalysis: any
}

// 调用Qwen-VL进行版权相似度分析
async function analyzeCopyrightSimilarity(
  reportedImageUrl: string, 
  originalImageUrl: string,
  reportedWork: any,
  originalWork: any
): Promise<ArbitrationResult> {
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
                { image: originalImageUrl },
                { image: reportedImageUrl },
                { 
                  text: `Perform a detailed copyright similarity analysis between these two artworks:

ORIGINAL WORK:
- Title: ${originalWork.title}
- Created: ${originalWork.created_at}
- Creator: ${originalWork.creator_address}
- Materials: ${originalWork.material?.join(', ') || 'N/A'}

REPORTED WORK:
- Title: ${reportedWork.title}
- Created: ${reportedWork.created_at}
- Creator: ${reportedWork.creator_address}
- Materials: ${reportedWork.material?.join(', ') || 'N/A'}

Analyze and provide a detailed JSON response with:
1. similarityScore: Overall similarity percentage (0-100)
2. disputedAreas: Array of specific similar elements found
3. timelineAnalysis: Comparison of creation dates and context
4. recommendation: "original", "derivative", "inspired", or "plagiarized"
5. confidence: AI confidence level (0-100)
6. detailedAnalysis: Detailed breakdown of similarities and differences

Focus on:
- Composition and layout similarities
- Color scheme and palette matching
- Character/object positioning
- Artistic style and technique
- Unique creative elements
- Overall visual impact

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
      // 如果解析失败，使用基础分析
      aiAnalysis = {
        similarityScore: 25,
        disputedAreas: ['Unable to parse AI response'],
        timelineAnalysis: { error: 'Analysis failed' },
        recommendation: 'manual_review_required',
        confidence: 50,
        detailedAnalysis: { error: 'Failed to parse AI response', rawResponse: aiResponse }
      }
    }

    // 确保返回值符合接口
    return {
      similarityScore: aiAnalysis.similarityScore || 0,
      disputedAreas: aiAnalysis.disputedAreas || [],
      timelineAnalysis: aiAnalysis.timelineAnalysis || {},
      recommendation: aiAnalysis.recommendation || 'manual_review_required',
      confidence: aiAnalysis.confidence || 50,
      detailedAnalysis: aiAnalysis.detailedAnalysis || aiAnalysis
    }

  } catch (error) {
    console.error('Qwen copyright analysis error:', error)
    
    // 返回基础分析结果
    return {
      similarityScore: 0,
      disputedAreas: ['AI analysis unavailable'],
      timelineAnalysis: { error: 'Analysis service unavailable' },
      recommendation: 'manual_review_required',
      confidence: 0,
      detailedAnalysis: { 
        error: 'AI analysis failed', 
        fallback: true,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reportId, reportedWorkId, originalWorkId }: CopyrightArbitrationRequest = await request.json()

    if (!reportId || !reportedWorkId || !originalWorkId) {
      return NextResponse.json(
        { error: 'Missing required fields: reportId, reportedWorkId, originalWorkId' },
        { status: 400 }
      )
    }

    console.log('🔍 Starting copyright arbitration:', {
      reportId,
      reportedWorkId,
      originalWorkId
    })

    // 获取两个作品的信息
    const { data: reportedWork, error: reportedError } = await supabaseAdmin
      .from('works')
      .select('*')
      .eq('work_id', reportedWorkId)
      .single()

    const { data: originalWork, error: originalError } = await supabaseAdmin
      .from('works')
      .select('*')
      .eq('work_id', originalWorkId)
      .single()

    if (reportedError || originalError || !reportedWork || !originalWork) {
      return NextResponse.json(
        { error: 'One or both works not found' },
        { status: 404 }
      )
    }

    // 验证时间线（被举报作品应该晚于原作品）
    const reportedDate = new Date(reportedWork.created_at)
    const originalDate = new Date(originalWork.created_at)
    
    if (reportedDate <= originalDate) {
      console.log('⚠️ Timeline issue: reported work is older than or same age as original')
    }

    // 更新举报状态为AI处理中
    try {
      await supabaseAdmin
        .from('work_reports')
        .update({ 
          status: 'ai_processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
    } catch (updateError) {
      console.log('⚠️ Failed to update report status (expected in development):', updateError)
    }

    // 进行AI版权相似度分析
    const arbitrationResult = await analyzeCopyrightSimilarity(
      reportedWork.image_url,
      originalWork.image_url,
      reportedWork,
      originalWork
    )

    console.log('🤖 AI arbitration result:', {
      similarityScore: arbitrationResult.similarityScore,
      recommendation: arbitrationResult.recommendation,
      confidence: arbitrationResult.confidence
    })

    // 保存AI仲裁报告到数据库
    try {
      const { data: arbitrationId, error: saveError } = await supabaseAdmin
        .from('ai_arbitration_reports')
        .insert({
          report_id: reportId,
          overall_similarity_score: arbitrationResult.similarityScore,
          disputed_areas: arbitrationResult.disputedAreas,
          timeline_analysis: arbitrationResult.timelineAnalysis,
          ai_recommendation: arbitrationResult.recommendation,
          ai_confidence: arbitrationResult.confidence,
          detailed_analysis: arbitrationResult.detailedAnalysis
        })
        .select('id')
        .single()

      if (saveError) {
        console.error('Failed to save arbitration report:', saveError)
      }
    } catch (saveError) {
      console.log('⚠️ Failed to save arbitration report (expected in development):', saveError)
    }

    // 根据相似度分数决定后续行动
    let finalStatus = 'resolved'
    let actionTaken = 'none'

    if (arbitrationResult.similarityScore >= 50) {
      // 高相似度 - 可能是抄袭
      finalStatus = 'escalated'
      actionTaken = 'high_similarity_detected'
      
      // TODO: 可以在这里添加自动锁定作品的逻辑
      console.log('🚨 High similarity detected - flagging for manual review')
      
    } else if (arbitrationResult.similarityScore >= 20) {
      // 中等相似度 - 需要人工审核
      finalStatus = 'under_review'
      actionTaken = 'manual_review_required'
      
    } else {
      // 低相似度 - 可能是误报
      finalStatus = 'resolved'
      actionTaken = 'no_copyright_violation_found'
    }

    // 更新最终举报状态
    try {
      await supabaseAdmin
        .from('work_reports')
        .update({
          status: finalStatus,
          ai_similarity_score: arbitrationResult.similarityScore,
          ai_verdict: arbitrationResult.recommendation,
          moderator_notes: `AI Arbitration completed. Similarity: ${arbitrationResult.similarityScore}%. Action: ${actionTaken}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
    } catch (updateError) {
      console.log('⚠️ Failed to update final report status (expected in development):', updateError)
    }

    console.log('✅ Copyright arbitration completed')

    return NextResponse.json({
      success: true,
      report: {
        reportId,
        similarityScore: arbitrationResult.similarityScore,
        recommendation: arbitrationResult.recommendation,
        confidence: arbitrationResult.confidence,
        disputedAreas: arbitrationResult.disputedAreas,
        timelineAnalysis: arbitrationResult.timelineAnalysis,
        actionTaken,
        status: finalStatus
      },
      message: `Arbitration completed. Similarity score: ${arbitrationResult.similarityScore}%`
    })

  } catch (error) {
    console.error('Copyright arbitration error:', error)
    
    // 更新举报状态为错误
    try {
      const body = await request.json()
      const reportId = body.reportId
      if (reportId) {
        await supabaseAdmin
          .from('work_reports')
          .update({
            status: 'pending',
            moderator_notes: 'AI arbitration failed - requires manual review',
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId)
      }
    } catch (updateError) {
      console.error('Failed to update report status after error:', updateError)
    }

    return NextResponse.json(
      { 
        error: 'Failed to process copyright arbitration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET: 获取仲裁报告
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ai_arbitration_reports')
      .select(`
        *,
        report:work_reports(
          *,
          reported_work:works!work_reports_reported_work_id_fkey(*),
          alleged_copied_work:works!work_reports_alleged_copied_work_id_fkey(*)
        )
      `)
      .eq('report_id', reportId)
      .single()

    if (error) throw error

    return NextResponse.json({ arbitrationReport: data })

  } catch (error) {
    console.error('Get arbitration report error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch arbitration report' },
      { status: 500 }
    )
  }
}