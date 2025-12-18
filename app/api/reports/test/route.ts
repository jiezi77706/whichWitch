import { NextRequest, NextResponse } from 'next/server'

// 简单的测试API，不依赖数据库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 Test report submission:', body)
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 返回模拟成功结果
    return NextResponse.json({
      success: true,
      reportId: Math.floor(Math.random() * 10000),
      message: 'Test report submitted successfully',
      receivedData: body
    })
    
  } catch (error) {
    console.error('Test report error:', error)
    return NextResponse.json(
      { 
        error: 'Test report failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Report test API is working',
    timestamp: new Date().toISOString()
  })
}