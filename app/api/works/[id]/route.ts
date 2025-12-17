import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workId = parseInt(params.id);
    
    if (isNaN(workId)) {
      return NextResponse.json(
        { error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('works')
      .select('*')
      .eq('work_id', workId)
      .single();

    if (error) {
      console.error('Error fetching work:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get work API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work' },
      { status: 500 }
    );
  }
}