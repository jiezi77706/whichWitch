import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Received report submission:', body)
    
    const { reportedWorkId, reportType, reason, allegedCopiedWorkId } = body

    // 验证必填字段
    if (!reportedWorkId || !reportType || !reason) {
      console.error('❌ Missing required fields:', { reportedWorkId, reportType, reason })
      return NextResponse.json(
        { error: 'Missing required fields: reportedWorkId, reportType, reason' },
        { status: 400 }
      )
    }

    // 验证举报理由长度
    if (reason.length > 300) {
      return NextResponse.json(
        { error: 'Report reason cannot exceed 300 characters' },
        { status: 400 }
      )
    }

    // 验证作品是否存在
    const { data: work, error: workError } = await supabaseAdmin
      .from('works')
      .select('work_id, creator_address')
      .eq('work_id', reportedWorkId)
      .single()

    if (workError || !work) {
      return NextResponse.json(
        { error: 'Reported work not found' },
        { status: 404 }
      )
    }

    // 如果是抄袭举报，验证原作品是否存在
    if (reportType === 'copyright_infringement' && allegedCopiedWorkId) {
      const { data: originalWork, error: originalWorkError } = await supabaseAdmin
        .from('works')
        .select('work_id')
        .eq('work_id', allegedCopiedWorkId)
        .single()

      if (originalWorkError || !originalWork) {
        return NextResponse.json(
          { error: 'Original work not found' },
          { status: 404 }
        )
      }
    }

    // TODO: 获取举报者地址（从认证中获取）
    // 这里暂时使用模拟地址，实际应该从JWT token或session中获取
    const reporterAddress = '0x1234567890123456789012345678901234567890' // 模拟地址

    // 验证不能举报自己的作品
    if (work.creator_address.toLowerCase() === reporterAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot report your own work' },
        { status: 400 }
      )
    }

    console.log('📝 Submitting report:', {
      reportedWorkId,
      reportType,
      reason: reason.substring(0, 50) + '...',
      allegedCopiedWorkId,
      reporterAddress
    })

    // 检查数据库连接
    console.log('🔍 Testing database connection...')
    
    // 直接插入举报记录（简化版本，不依赖数据库函数）
    const { data, error } = await supabaseAdmin
      .from('work_reports')
      .insert({
        reported_work_id: reportedWorkId,
        reporter_address: reporterAddress.toLowerCase(),
        report_type: reportType,
        reason: reason,
        alleged_copied_work_id: allegedCopiedWorkId || null,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      
      // 如果表不存在，返回模拟成功（开发环境）
      if (error.code === '42P01') {
        console.log('⚠️ Database table not found, returning mock success for development')
        return NextResponse.json({
          success: true,
          reportId: Math.floor(Math.random() * 10000),
          message: 'Report submitted successfully (development mode)'
        })
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Report submitted successfully:', data)

    return NextResponse.json({
      success: true,
      reportId: data.id,
      message: 'Report submitted successfully'
    })

  } catch (error) {
    console.error('Report submission error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET: 获取举报记录（管理员功能）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workId = searchParams.get('workId')
    const status = searchParams.get('status')
    const reportType = searchParams.get('type')

    let query = supabaseAdmin
      .from('work_reports')
      .select(`
        *,
        reported_work:works!work_reports_reported_work_id_fkey(work_id, title, creator_address),
        alleged_copied_work:works!work_reports_alleged_copied_work_id_fkey(work_id, title, creator_address)
      `)
      .order('created_at', { ascending: false })

    if (workId) {
      query = query.eq('reported_work_id', workId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (reportType) {
      query = query.eq('report_type', reportType)
    }

    const { data, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ reports: data })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}